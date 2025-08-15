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
