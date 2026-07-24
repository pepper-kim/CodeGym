#!/usr/bin/env bash
set -euo pipefail

cluster_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
lab_dir="$(cd "$cluster_dir/.." && pwd)"
compose=(docker compose -f "$cluster_dir/compose.yaml")
target="${1:-}"

case "$target" in
  tiny) csv="$lab_dir/data/tiny_user_chats.csv" ;;
  benchmark) csv="$lab_dir/data/benchmark_user_chats.csv" ;;
  *) echo "usage: $0 tiny|benchmark" >&2; exit 2 ;;
esac

if [[ ! -f "$csv" ]]; then
  if [[ "$target" == benchmark ]]; then
    echo "missing $csv" >&2
    echo "run: $lab_dir/.venv/bin/python $lab_dir/demo.py export" >&2
  else
    echo "missing $csv" >&2
  fi
  exit 1
fi

mysql_in_container() {
  "${compose[@]}" exec -T starrocks \
    mysql -h127.0.0.1 -P9030 -uroot "$@"
}

ready=false
for _ in {1..60}; do
  if curl -fsS http://127.0.0.1:8030/api/bootstrap \
      | grep -q '"status":"OK"' \
    && mysql_in_container --batch --skip-column-names -e "SHOW BACKENDS" 2>/dev/null \
      | awk -F '\t' '$9 == "true" { found=1 } END { exit !found }'; then
    ready=true
    break
  fi
  sleep 2
done
if [[ "$ready" != true ]]; then
  echo "StarRocks FE and BE were not ready within 120 seconds" >&2
  echo "check: ${compose[*]} logs starrocks" >&2
  exit 1
fi

mysql_in_container < "$cluster_dir/schema.sql"
mysql_in_container -e "TRUNCATE TABLE vector_lab.user_chats"

expected_rows=$(( $(wc -l < "$csv") - 1 ))
response_file="$(mktemp "${TMPDIR:-/tmp}/vector-lab-load.XXXXXX")"
trap 'rm -f "$response_file"' EXIT
label="vector_lab_${target}_$(date +%s)_$$"

http_code="$(curl --location-trusted --silent --show-error \
  --user root: \
  --header "label:$label" \
  --header "Expect:100-continue" \
  --header "format:csv" \
  --header "column_separator:," \
  --header "skip_header:1" \
  --header "strict_mode:true" \
  --upload-file "$csv" \
  --request PUT \
  --output "$response_file" \
  --write-out '%{http_code}' \
  http://127.0.0.1:8030/api/vector_lab/user_chats/_stream_load)"

cat "$response_file"
python3 - "$response_file" "$http_code" "$expected_rows" <<'PY'
import json
import sys

path, http_code, expected = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
with open(path, encoding="utf-8") as source:
    response = json.load(source)
status = response.get("Status")
loaded = int(response.get("NumberLoadedRows", -1))
if http_code != 200 or status != "Success" or loaded != expected:
    raise SystemExit(
        f"Stream Load failed: HTTP={http_code}, Status={status}, "
        f"NumberLoadedRows={loaded}, expected={expected}"
    )
PY

actual_rows="$(mysql_in_container --batch --skip-column-names \
  -e "SELECT COUNT(*) FROM vector_lab.user_chats")"
if [[ "$actual_rows" != "$expected_rows" ]]; then
  echo "row count mismatch: expected=$expected_rows actual=$actual_rows" >&2
  exit 1
fi
echo "Loaded $actual_rows rows into vector_lab.user_chats"
