# RocksDB 학습 목표

상위 학습 목표와 공통 원칙은 [`database/README.md`](../README.md)를 따른다.

RocksDB를 단일 노드에 내장되는 LSM 기반 ordered key-value storage engine으로 이해한다. 하나의 키와 트랜잭션이 쓰기 요청부터 가시성 결정, 탐색, Flush, Compaction, 삭제, 공간 회수, 장애 후 재시작까지 이동하는 전 생명주기를 추적하고, 각 단계가 만드는 보장과 비용을 예측할 수 있어야 한다.

RocksDB만 고립해서 암기하지 않는다. 『Database Internals』에서 배운 파일 구조, 동시성 제어, 복구, 무결성, 자원 관리 원리를 RocksDB에 적용하고, 이후 Berkeley DB, InnoDB, PostgreSQL과 비교할 수 있는 기반을 만든다.

## 단계별 완료 기준

| 단계 | 중심 질문 | RocksDB에서 설명할 수 있어야 하는 것 |
|---|---|---|
| 1. 요구사항과 경계 | RocksDB는 어떤 문제를 해결하고 무엇을 상위 계층에 남기는가? | RocksDB가 byte-array key와 value를 정렬해 저장하는 embedded single-node engine임을 설명한다. SQL, JOIN, schema, constraint, secondary index의 자동 유지, shard 배치, replication, consensus는 기본 엔진의 책임이 아니며, 필요한 인덱스와 제약은 애플리케이션이 인코딩하고 원자적으로 갱신해야 한다는 경계를 구분한다. |
| 2. 저장과 탐색 | 값은 어디에 있고 point lookup과 range scan은 어떻게 다른가? | MemTable, immutable MemTable, SSTable의 data/index/filter block, block cache, L0의 겹치는 범위와 L1 이상의 겹치지 않는 범위를 연결한다. `Get`이 Bloom filter로 많은 파일을 제외하는 과정과 Iterator가 여러 MemTable·run·level을 정렬 병합하며 tombstone의 영향까지 받는 과정을 구분한다. |
| 3. 변경과 비용 이연 | 현재의 작은 쓰기가 미래에 어떤 비용을 만드는가? | Put, Delete, Merge가 WAL, MemTable, Flush, Compaction을 거치는 과정을 설명한다. Leveled, Tiered/Universal, FIFO Compaction이 read, write, space amplification을 어디에 배치하는지 비교하고, compaction picker 내부 구현과 정책의 원리를 구분한다. |
| 4. 동시성과 가시성 | 여러 읽기와 쓰기가 겹칠 때 무엇이 보이고 충돌은 어떻게 처리되는가? | InternalKey, Sequence Number, LastPublishedSequence, Snapshot, read sequence, SuperVersion으로 논리적 시점과 물리 구조 뷰를 구분한다. WriteBatch atomicity와 transaction isolation의 차이, `TransactionDB`의 비관적 잠금, `OptimisticTransactionDB`의 commit-time conflict validation, `GetForUpdate`의 역할과 wait·abort·retry 비용을 설명한다. |
| 5. 장애, 복구, 무결성 | 성공한 쓰기는 어떤 장애까지 살아남고 저장된 바이트가 손상되면 어떻게 아는가? | `sync=true`, buffered WAL, no-WAL과 process crash, machine/power crash를 구분한다. `CURRENT → MANIFEST → VersionSet과 live SST 집합 → WAL replay → MemTable 재구성` 흐름으로 재시작을 설명하고 Flush를 commit으로 해석하지 않는다. Durability와 data integrity, checksum을 이용한 손상 탐지와 정상 replica·backup을 이용한 복구를 구분한다. |
| 6. 시간 경과와 자원 | 오래 실행될수록 죽은 버전과 백그라운드 작업은 어떤 압력을 만드는가? | tombstone, 과거 버전, 오래된 Snapshot과 Iterator가 논리 버전 또는 물리 파일의 회수를 어떻게 지연하는지 구분한다. Compaction backlog가 LSM 비대화, amplification 증가, foreground write stall로 이어지는 과정을 설명한다. MemTable/write buffer, block cache, allocator overhead, compression·checksum CPU, compaction I/O·thread, disk와 file deletion rate를 per-instance와 per-host 관점에서 관리해야 하는 이유를 설명한다. |
| 7. 분산 책임 경계 | 상위 분산 시스템을 위해 무엇을 제공하고 무엇을 보장하지 않는가? | Snapshot과 Checkpoint, logical copy와 physical copy, live-file 고정, Backup Engine의 역할을 구분한다. RocksDB가 제공하는 로컬 원자성·복구·복사 재료와 상위 시스템이 담당하는 replication order, consensus, cross-shard transaction, 전역 논리 시점, load balancing, backup 정책을 구분한다. |
| 8. 설계 평가 | 어떤 워크로드와 하드웨어에서 RocksDB와 LSM이 적합한가? | point/range 읽기, 쓰기량, value 크기, 필요한 보장, SSD·메모리·CPU 조건을 바탕으로 LSM과 B+tree 계열을 검토할 이유와 측정 지표를 제시한다. 로컬 SSD를 중심으로 발전한 전제와 큰 value 분리 같은 대안을 고려하되 보편적인 승자를 선언하지 않는다. |

Column Family와 DB 인스턴스의 경계는 모든 단계에 걸쳐 다음과 같이 유지한다.

- 같은 DB의 Column Family는 각자의 MemTable, SSTable, 설정을 가지지만 WAL과 Sequence 공간을 공유한다.
- 하나의 WriteBatch 또는 Transaction은 같은 DB의 여러 Column Family에 대한 변경을 원자적으로 묶을 수 있다.
- 서로 다른 DB 인스턴스는 Sequence, Snapshot, WAL, atomic commit 경계를 공유하지 않는다.
- Column Family는 관계형 또는 columnar database의 column과 같은 개념이 아니다.

## 애플리케이션 확장 기능의 경계

- Merge Operator는 read-modify-write의 일부 비용을 지연시키지만, unresolved operand가 길어지면 읽기와 Compaction 비용이 증가한다.
- Compaction Filter는 TTL이나 MVCC garbage collection에 활용할 수 있지만, 잘못 사용하면 Snapshot의 반복 읽기 같은 보장을 약화할 수 있다.
- 이러한 callback의 용도와 보장·비용은 배우되 callback 구현 코드와 모든 옵션을 암기하지 않는다.

## 출처와 학습 깊이

- 2021 RocksDB 논문이 직접 설명하는 구조, 운영 경험, 보장과 한계를 먼저 원문으로 읽는다.
- SuperVersion, LastPublishedSequence, MANIFEST recovery, TransactionDB처럼 논문만으로 부족한 내용은 현재 upstream 문서와 코드를 별도 근거로 사용한다.
- 논문 주장, 현재 upstream 동작, 『Database Internals』의 일반 원리, 이해를 위한 추론을 한 문장 안에서 섞지 않는다.
- 수업은 `예측 → 원문 발췌 → 직역 → 시간순 상태 흐름 → 보장·비보장·알 수 없음 → 확인 문제` 순서로 진행한다.

Checksum은 RocksDB 핵심 완료 범위에 포함한다. 다만 checksum과 CRC의 구현 알고리즘, 모든 관련 옵션은 학습하지 않고 `durability와 integrity의 차이`, `탐지와 복구의 차이`, `검증 범위`까지만 배운다.

On-disk format versioning과 compatibility는 『Database Internals』 3장의 일반 원리를 배운 뒤 RocksDB 논문 §4.4의 upgrade, rollback, file copy 사례로 연결한다. 이는 RocksDB 핵심 선행학습이나 별도 구현 심화 과정으로 두지 않는다.

## 종료 시험

다음 흐름을 보고 논리 결과와 물리 상태를 함께 설명할 수 있어야 한다.

```text
Put(v1)
→ Snapshot S
→ concurrent read-modify-write
→ Put(v2)
→ Delete
→ Flush
→ Compaction
→ 일반 Get / Snapshot Get / Iterator
→ process crash 또는 power loss
→ 재시작
```

최소한 다음 질문에 답할 수 있어야 한다.

- 각 읽기가 반환하는 값과 그 값을 선택한 Sequence 경계는 무엇인가?
- plain RocksDB, TransactionDB, OptimisticTransactionDB에서 동시 변경의 결과가 왜 다른가?
- 각 버전과 tombstone이 존재할 수 있는 물리 구조와 안전하게 제거되는 시점은 언제인가?
- Snapshot과 SuperVersion 또는 Iterator가 각각 무엇의 생존을 요구하는가?
- 재시작할 때 MANIFEST, SST, WAL이 각각 어떤 역할을 하는가?
- checksum 실패는 무엇을 의미하며 RocksDB 단독으로 원본을 복원할 수 있는가?
- 이 생명주기에서 발생하는 read, write, space amplification은 무엇인가?

운영 관점에서는 한 호스트의 RocksDB 인스턴스 100개가 동시에 Flush와 Compaction을 요청하는 상황을 분석한다. 각 인스턴스의 지역 최적화 합이 호스트 전체 최적화가 아닌 이유와 memory, CPU, I/O, thread, disk, backpressure를 전역·지역적으로 제어하는 방법을 설명할 수 있어야 한다.

## 선택 심화 또는 비목표

- `WriteThread`, `WriteGroup`, mutex, writer queue와 scheduler 내부 구현
- compaction picker와 모든 Compaction 옵션의 내부 동작
- lock table, deadlock detector, `WritePrepared`, `WriteUnprepared`의 내부 구현
- MANIFEST record encoding과 checksum 알고리즘 구현
- 모든 설정값과 benchmark 수치 암기
- Timestamp API와 Table 6의 상세
- on-disk format compatibility matrix와 migration tool 구현
- RocksDB가 담당하지 않는 Raft, consensus, 분산 트랜잭션 coordinator의 구현
- SuperVersion 클래스와 reference count 코드 암기

## 다음 합의 항목

1. RocksDB 전체 학습 목차
2. 지금까지 학습한 내용
3. 앞으로 학습할 내용과 순서
