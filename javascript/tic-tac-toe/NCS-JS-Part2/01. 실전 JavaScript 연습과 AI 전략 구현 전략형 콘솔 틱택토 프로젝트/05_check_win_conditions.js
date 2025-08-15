/**
 * 3x3 틱택토 보드를 생성하여 초기화합니다.
 *
 * - 총 10개의 요소를 가진 배열을 반환하며, 인덱스 0은 사용하지 않고 비워둡니다.
 * - 인덱스 1~9는 실제 게임에 사용되며, 초기값은 모두 빈 문자열(" ")입니다.
 * - 키패드 배열(7~9, 4~6, 1~3) 형태를 맞추기 위해 index 1~9만 사용합니다.
 *
 * @returns {string[]} 초기화된 보드 배열 (길이: 10, board[1] ~ board[9] 사용)
 */
function createBoard() {
  let board = [];

  for (let i = 0; i < 10; i++) {
    board.push(" ");
  }

  return board;
}

/**
 * 현재 보드 상태를 콘솔에 3x3 형태로 출력합니다.
 *
 * - 콘솔 화면을 먼저 clear()하여 매 턴마다 깔끔하게 보드를 갱신합니다.
 * - 보드는 키패드 배열처럼 아래에서 위로 출력됩니다 (1~3, 4~6, 7~9 순서).
 * - 각 줄을 출력할 때 "|"와 구분선("-----------")으로 구분하여 시각적으로 보기 좋게 표시합니다.
 *
 * @param {string[]} board - 출력할 보드 배열 (인덱스 1~9 사용)
 * @returns {void}
 */
function displayBoard(board) {
  console.clear();

  console.log(" " + board[7] + " | " + board[8] + " | " + board[9]);
  console.log("-----------");
  console.log(" " + board[4] + " | " + board[5] + " | " + board[6]);
  console.log("-----------");
  console.log(" " + board[1] + " | " + board[2] + " | " + board[3]);
}

/**
 * 플레이어 1이 사용할 마커(X 또는 O)를 선택하고
 * 플레이어 2에게 나머지 마커를 자동으로 배정합니다.
 *
 * - 플레이어 1이 'X' 또는 'O'를 입력할 때까지 계속 입력을 요청합니다.
 * - 입력은 대소문자를 구분하지 않으며, 소문자 입력도 자동으로 대문자로 변환됩니다.
 * - 선택된 마커에 따라 나머지 마커가 플레이어 2에게 자동 할당됩니다.
 *
 * @returns {[string, string]} [플레이어1의 마커, 플레이어2의 마커]
 */
function chooseMarker() {
  let player1Marker = "";

  while (player1Marker !== "X" && player1Marker !== "O") {
    player1Marker = prompt(
      "플레이어 1, 사용할 마커를 선택하세요 (X 또는 O): "
    ).toUpperCase();
  }

  let player2Marker = player1Marker === "X" ? "O" : "X";
  return [player1Marker, player2Marker];
}

/**
 * 누가 먼저 시작할지를 무작위로 결정합니다.
 *
 * - Math.random()을 사용해 50% 확률로 '플레이어 1' 또는 '플레이어 2'를 반환합니다.
 * - 게임 시작 시 선공자를 랜덤으로 지정할 때 사용됩니다.
 *
 * @returns {string} '플레이어 1' 또는 '플레이어 2'
 */
function chooseFirstPlayer() {
  return Math.random() < 0.5 ? "플레이어 1" : "플레이어 2";
}

/**
 * 보드의 지정한 위치에 플레이어의 마커를 놓습니다.
 *
 * @param {string[]} board - 현재 보드 배열
 * @param {string} marker - 플레이어의 마커 ('X' 또는 'O')
 * @param {number} position - 마커를 놓을 위치 (1 ~ 9)
 * @returns {void}
 */
function placeMarker(board, marker, position) {
  board[position] = marker;
}

/**
 * 지정한 보드 위치가 비어 있는지 확인합니다.
 *
 * @param {string[]} board - 현재 보드 배열
 * @param {number} position - 확인할 위치 (1 ~ 9)
 * @returns {boolean} 해당 위치가 비어 있으면 true, 아니면 false
 */
function spaceCheck(board, position) {
  return board[position] === " ";
}

/**
 * 플레이어에게 보드의 위치를 입력받고, 유효한 위치가 입력될 때까지 반복합니다.
 *
 * - 1부터 9 사이의 숫자를 입력해야 하며,
 * - 이미 마커가 놓인 칸은 선택할 수 없습니다.
 * - 잘못된 입력 시 콘솔에 오류 메시지를 출력합니다.
 *
 * @param {string[]} board - 현재 보드 배열
 * @returns {number} 플레이어가 선택한 유효한 위치 (1 ~ 9)
 */
function playerChoice(board) {
  let position = 0;
  const validPositions = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // 유효하지 않거나 이미 사용된 칸이면 계속 반복
  while (!validPositions.includes(position) || !spaceCheck(board, position)) {
    let input = prompt("다음 위치를 선택하세요 (1 ~ 9): ");
    position = Number(input);

    if (!validPositions.includes(position)) {
      console.log("잘못된 입력입니다. 1~9 사이 숫자를 입력해 주세요.");
    } else if (!spaceCheck(board, position)) {
      console.log("이미 사용된 칸입니다. 다른 위치를 선택해 주세요.");
    }
  }

  return position;
}

/**
 * 지정된 마커가 가로(행)로 3개 연속 나열되어 있는지 확인합니다.
 *
 * - 3개의 가로 줄 (7-8-9, 4-5-6, 1-2-3)을 검사합니다.
 *
 * @param {string[]} board - 현재 보드 배열
 * @param {string} marker - 검사할 플레이어의 마커 ('X' 또는 'O')
 * @returns {boolean} 가로 줄 중 하나가 같은 마커로 채워져 있으면 true
 */
function checkRows(board, marker) {
  if (
    (board[7] === marker && board[8] === marker && board[9] === marker) || // 상단 가로
    (board[4] === marker && board[5] === marker && board[6] === marker) || // 중간 가로
    (board[1] === marker && board[2] === marker && board[3] === marker) // 하단 가로
  ) {
    return true;
  }
  return false;
}

/**
 * 지정된 마커가 세로(열)로 3개 연속 나열되어 있는지 확인합니다.
 *
 * - 3개의 세로 줄 (7-4-1, 8-5-2, 9-6-3)을 검사합니다.
 *
 * @param {string[]} board - 현재 보드 배열
 * @param {string} marker - 검사할 플레이어의 마커 ('X' 또는 'O')
 * @returns {boolean} 세로 줄 중 하나가 같은 마커로 채워져 있으면 true
 */
function checkCols(board, marker) {
  if (
    (board[7] === marker && board[4] === marker && board[1] === marker) || // 좌측 세로
    (board[8] === marker && board[5] === marker && board[2] === marker) || // 중앙 세로
    (board[9] === marker && board[6] === marker && board[3] === marker) // 우측 세로
  ) {
    return true;
  }
  return false;
}

/**
 * 지정된 마커가 대각선으로 3개 연속 나열되어 있는지 확인합니다.
 *
 * - 두 개의 대각선 (7-5-3, 9-5-1)을 검사합니다.
 *
 * @param {string[]} board - 현재 보드 배열
 * @param {string} marker - 검사할 플레이어의 마커 ('X' 또는 'O')
 * @returns {boolean} 대각선 중 하나가 같은 마커로 채워져 있으면 true
 */
function checkDiags(board, marker) {
  if (
    (board[7] === marker && board[5] === marker && board[3] === marker) || // ↘ 방향 대각선
    (board[9] === marker && board[5] === marker && board[1] === marker) // ↙ 방향 대각선
  ) {
    return true;
  }
  return false;
}

/**
 * 플레이어가 게임에서 승리했는지를 판단합니다.
 *
 * - 가로, 세로, 대각선 방향에서 마커가 연속 3개 있는지 확인합니다.
 * - checkRows, checkCols, checkDiags를 내부적으로 호출하여 통합 검사합니다.
 *
 * @param {string[]} board - 현재 보드 배열
 * @param {string} marker - 검사할 플레이어의 마커 ('X' 또는 'O')
 * @returns {boolean} 승리 조건을 만족하면 true, 아니면 false
 */
function checkWin(board, marker) {
  if (
    checkRows(board, marker) ||
    checkCols(board, marker) ||
    checkDiags(board, marker)
  ) {
    return true;
  }
  return false;
}
