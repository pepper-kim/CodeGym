# Window
## Instance methods
### requestAnimationFrame()
https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- 브라우저에게 animation을 실행하라고 요청함.
- 이때, 사용자가 넘긴 callback 함수를 repaint 전에 실행하게 함.
- callback 함수를 호출하는 빈도는 일반적으론 display refresh rate와 일치함. 가장 흔한 refresh rate는 60hz임.
