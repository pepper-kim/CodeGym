# javascript event

## Window
`Window` 인터페이스는 DOM 문서를 포함하고 있는 window를 나타낸다. 전역 변수인 `window`는 자바스크립트 코드에서 접근할 수 있다.

## EventTarget
- `EventTarget`는 이벤트를 수신할 수 있거나, 자신으로 부터 이벤트를 들으려고 하는 객체들이 구현한다.
- ref: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener

### 메소드 종류
- EventTarget.addEventListener();
- EventTarget.removeEventListener();
- EventTarget.dispatchEvent();

## HTML 문서 생명주기 관련 주요 이벤트
### `DOMContentLoaded`
- 브라우저가 HTML 문서를 다 읽고 DOM 트리를 완성하는 즉시 발생. 이미지 파일 및 스크립트 등 기타 지원은 기다리지 않음.
- DOM 요소를 접근해야 하지만 이미지 파일 등은 기다릴 필요 없을 떄 사용.
### `load`
- 브라우저가 모든 로딩 과정을 끝났을 때 발생. 이미지가 로딩되고 스크립트 파일도 모두 실행 됨.
- 이미지 파일 크기 등을 이용하여 로직을 실행 해야 할 경우에 사용.
### `beforeunload`/`unload`
- 사용자가 페이지를 떠날 때 발생.
- 사용자가 떠나기 전 미리 저장 알람을 하거나 방문 통계 등을 계산할 때 사용.