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

/**
 * 보드에 더 이상 남은 빈 칸이 있는지 확인합니다.
 *
 * - 인덱스 1부터 9까지 반복하며 빈 칸(" ")이 하나라도 있으면 false를 반환합니다.
 * - 빈 칸이 전혀 없으면 보드가 가득 찬 상태로 간주하고 true를 반환합니다.
 * - 무승부 상황 판단 등에 사용됩니다.
 *
 * @param {string[]} board - 현재 보드 배열 (인덱스 1~9 사용)
 * @returns {boolean} 보드가 가득 차 있으면 true, 아니면 false
 */
function fullBoardCheck(board) {
  for (let i = 1; i <= 9; i++) {
    if (board[i] === " ") {
      return false; // 아직 비어 있는 칸이 있으므로 false
    }
  }
  return true; // 모든 칸이 채워져 있으면 true
}

/**
 * 보드에서 비어 있는 칸들 중 무작위로 하나를 선택하여 반환합니다.
 *
 * - 먼저 보드의 인덱스 1~9를 순회하며 빈 칸(" ")을 모두 수집합니다.
 * - 그 중 하나를 무작위로 골라 반환합니다.
 * - 주로 컴퓨터 플레이어가 아무 전략 없이 랜덤하게 수를 두는 데 사용됩니다.
 *
 * @param {string[]} board - 현재 보드 배열 (인덱스 1~9 사용)
 * @returns {number} 랜덤으로 선택된 빈 칸의 위치 (1 ~ 9)
 */
function getRandomEmptyPosition(board) {
  let emptyPositions = [];

  // 1~9번 인덱스를 순회하며 빈 칸들을 수집
  for (let i = 1; i <= 9; i++) {
    if (board[i] === " ") {
      emptyPositions.push(i);
    }
  }

  // 수집된 빈 칸 중 무작위 인덱스를 선택
  let randomIndex = Math.floor(Math.random() * emptyPositions.length);

  // 해당 위치 반환
  return emptyPositions[randomIndex];
}

/**
 * 현재 차례인 마커(marker)가 놓일 경우 이길 수 있는 자리를 먼저 찾아 반환합니다.
 *
 * - 보드의 모든 빈 칸을 하나씩 시뮬레이션하면서 해당 칸에 마커를 놓아봅니다.
 * - 해당 위치에 마커를 놓았을 때 승리 조건을 만족하는 경우 해당 위치를 반환합니다.
 * - 이길 수 있는 자리가 없다면, getRandomEmptyPosition()을 호출하여 랜덤 위치를 선택합니다.
 *
 * @param {string[]} board - 현재 보드 배열 (인덱스 1~9 사용)
 * @param {string} marker - 컴퓨터가 사용하는 마커 ('X' 또는 'O')
 * @returns {number} 컴퓨터가 선택한 위치 (이길 수 있는 자리가 우선, 없으면 랜덤)
 */
function getSmartPosition(board, marker) {
  // 1~9번 칸을 순회하며 시뮬레이션
  for (let i = 1; i <= 9; i++) {
    if (board[i] === " ") {
      // 해당 위치에 마커를 임시로 놓아봄
      board[i] = marker;

      // 마커를 놓았을 때 승리하는지 검사
      if (checkWin(board, marker)) {
        board[i] = " "; // 시뮬레이션 후 원상복구
        return i; // 이길 수 있는 위치이므로 바로 반환
      }

      // 승리하지 못하면 다시 빈칸으로 되돌림
      board[i] = " ";
    }
  }

  // 이길 수 있는 자리가 없다면, 무작위로 빈칸 선택
  return getRandomEmptyPosition(board);
}

/**
 * 현재 차례인 마커(marker)가 놓일 경우 이길 수 있는 자리를 먼저 찾아 반환합니다.
 *
 * - 보드의 모든 빈 칸을 하나씩 시뮬레이션하면서 해당 칸에 마커를 놓아봅니다.
 * - 해당 위치에 마커를 놓았을 때 승리 조건을 만족하는 경우 해당 위치를 반환합니다.
 * - 이길 수 있는 자리가 없다면, getRandomEmptyPosition()을 호출하여 랜덤 위치를 선택합니다.
 *
 * @param {string[]} board - 현재 보드 배열 (인덱스 1~9 사용)
 * @param {string} marker - 컴퓨터가 사용하는 마커 ('X' 또는 'O')
 * @returns {number} 컴퓨터가 선택한 위치 (이길 수 있는 자리가 우선, 없으면 랜덤)
 */

/**
 * 틱택토 게임을 실행하는 메인 함수입니다.
 *
 * - 플레이어 마커 선택, 선공 결정, 보드 생성, 턴 진행, 승리/무승부 판정까지 모든 흐름을 포함합니다.
 * - 게임이 끝난 뒤에는 다시 시작할지 여부를 사용자에게 묻고, 반복 여부를 결정합니다.
 *
 * 주요 흐름:
 * 1. 보드 초기화
 * 2. 마커 선택 및 선공 결정
 * 3. 플레이어 턴 진행 (Player 1과 Player 2 번갈아가며)
 * 4. 매 턴마다 승리 여부 및 무승부 체크
 * 5. 게임 종료 후 재시작 여부 확인
 *
 * @returns {void}
 */
function runGame() {
  console.log("틱택토 게임에 오신 것을 환영합니다!");

  while (true) {
    // 1) 보드 생성
    let theBoard = createBoard();

    // 2) 플레이어들 마커 선택 (플레이어1 X/O)
    let [player1_marker, player2_marker] = chooseMarker();

    // 3) 선공 결정
    let turn = chooseFirstPlayer();
    console.log(turn + " 님이 먼저 시작합니다!");

    // 4) 플레이 여부 확인
    let playGame = prompt("플레이할 준비가 되셨나요? (Yes/No)").toLowerCase();
    let gameOn = playGame.startsWith("y") ? true : false;

    if (!gameOn) {
      console.log("게임을 시작하지 않았습니다. (이번 판은 진행 안 함)");
    }

    // 5) 게임 진행 루프
    while (gameOn) {
      if (turn === "Player 1") {
        // Player 1의 턴
        displayBoard(theBoard); // 현재 보드 출력
        let position = playerChoice(theBoard); // 위치 입력 받기
        placeMarker(theBoard, player1_marker, position); // 마커 놓기

        // 승리 여부 검사
        if (checkWin(theBoard, player1_marker)) {
          displayBoard(theBoard);
          console.log("축하합니다! Player 1 승리!");
          gameOn = false;
        }
        // 무승부 여부 검사
        else if (fullBoardCheck(theBoard)) {
          displayBoard(theBoard);
          console.log("무승부입니다!");
          gameOn = false;
        }
        // 다음 차례는 Player 2
        else {
          turn = "Player 2";
        }
      }

      // Player 2의 턴 (컴퓨터 또는 AI)
      else {
        displayBoard(theBoard);

        // 랜덤 AI 또는 스마트 AI 선택 가능
        // let position = getRandomEmptyPosition(theBoard);
        let position = getSmartPosition(theBoard, player2_marker); // 전략형 AI 사용 시

        placeMarker(theBoard, player2_marker, position);

        if (checkWin(theBoard, player2_marker)) {
          displayBoard(theBoard);
          console.log("축하합니다! Player 2 승리!");
          gameOn = false;
        } else if (fullBoardCheck(theBoard)) {
          displayBoard(theBoard);
          console.log("무승부입니다!");
          gameOn = false;
        } else {
          turn = "Player 1";
        }
      }
    } // while(gameOn)

    // 게임 종료 후, 다시 시작할지 묻기
    if (!replay()) {
      console.log("게임을 종료합니다. 즐거운 시간 되셨길 바랍니다!");
      break; // 전체 while 루프 종료 → 프로그램 종료
    }
  }
}
