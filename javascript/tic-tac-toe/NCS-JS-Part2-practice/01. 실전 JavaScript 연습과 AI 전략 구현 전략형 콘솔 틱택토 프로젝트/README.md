# 🎮 JavaScript 콘솔 기반 틱택토 게임

이 프로젝트는 JavaScript로 CLI(콘솔) 기반 틱택토 게임을 단계별로 구현하는 학습용 프로젝트입니다.  
각 기능은 별도의 JS 파일로 나뉘어 있으며, `index.html` 파일에서 `<script src="">` 경로를 하나씩 연결해 실습하고 테스트할 수 있습니다.

---

## 📂 사용법 안내

### 1. `index.html`에 JS 파일 연결하기

`index.html` 파일에서 아래와 같이 `<script>` 태그의 `src` 값을 원하는 파일명으로 변경해 테스트할 수 있습니다:

```html
<!-- 예시: 01_intro_project_structure.js 연결 -->
<script src="./01_intro_project_structure.js"></script>
```

> 💡 각 파일은 독립적으로 테스트할 수 있도록 작성되어 있으며, `src` 경로를 수정한 후 저장하면 자동으로 Live Server에서 반영됩니다.

---

## 🚀 Live Server로 실행하기

### Visual Studio Code에서 Live Server 확장 설치

1. VS Code 왼쪽 확장(Extension) 탭 클릭
2. `Live Server` 검색 후 설치
3. `index.html` 파일을 열고 **오른쪽 아래 'Go Live' 버튼 클릭**  
   또는 마우스 우클릭 → **'Open with Live Server' 선택**

---

## 💻 브라우저에서 콘솔 열기 (JavaScript 출력 확인용)

### macOS

| 브라우저 | 콘솔 열기 단축키                                      |
| -------- | ----------------------------------------------------- |
| Chrome   | `Command + Option + J`                                |
| Safari   | `Command + Option + C` (먼저 개발자 도구 활성화 필요) |
| Firefox  | `Command + Option + K`                                |

### Windows

| 브라우저 | 콘솔 열기 단축키                        |
| -------- | --------------------------------------- |
| Chrome   | `Ctrl + Shift + J`                      |
| Edge     | `Ctrl + Shift + I` 후 'Console' 탭 클릭 |
| Firefox  | `Ctrl + Shift + K`                      |

---

## ✅ 테스트 순서 예시

아래 순서대로 JS 파일을 `index.html`에 연결하여 실습해보세요:

1. `01_intro_project_structure.js`
2. `02_create_and_display_board.js`
3. `03_choose_marker_and_first_player.js`
4. `04_turn_handling_and_place_marker.js`
5. `05_check_win_conditions.js`
6. `06_check_draw_condition.js`
7. `07_run_game_function.js`
8. `08_random_ai_move.js`
9. `09_strategic_ai_win_first.js`

---

## 📌 기타 팁

- **콘솔이 아무 반응이 없다면?**

  - 파일이 저장되었는지 확인하세요.
  - `<script>` 태그가 `</body>` 바로 위에 있는지 확인하세요.
  - `console.log()` 출력이 있는지 확인하세요.

- **Safari에서 개발자 도구가 안 보인다면?**
  - 상단 메뉴 > Safari > 환경설정 > '고급' 탭 >  
    '메뉴 막대에서 개발자용 메뉴 보기' 옵션을 체크하세요.

---

## 🧪 index.html 예시 템플릿

아래는 JavaScript 파일을 연결해서 테스트할 수 있는 `index.html` 기본 템플릿입니다:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tic Tac Toe Console Game</title>
  </head>
  <body>
    <h1>JavaScript Console Tic Tac Toe</h1>
    <p>콘솔을 열고 결과를 확인하세요. (See output in console)</p>

    <!-- JS 파일은 아래에서 교체하세요 -->
    <script src="./01_intro_project_structure.js"></script>
  </body>
</html>
```

> 🛠️ `<script src="./파일명.js">` 경로만 바꿔가며 각 강의별 기능을 확인해보세요.

---

**Happy Coding! 😄**
