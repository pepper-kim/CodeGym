# CSS transform
- 변형에 관련된 것. 크기, 위치, 기준을 변경 가능함.
- 하드웨어 가속을 이용(=gpu 사용)했기에 성능이 좋음.

# CSS transition
- 두 CSS 상태 간의 전이를 정의할 수 있는 속성.
- 변형되는데 걸리는 시간과 가속도 등을 조절할 수 있음.
- ref: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions/Using_CSS_transitions
### 구성 요소
- transition-property : 전이 효과가 적용되는 범위를 설정. ex) all, none, color, margin-right etc.
- transition-duration : 전이 효과가 적용되는 시간.
- transition-timing-function : 전이 효과가 적용되는 중간 값을 계산하는 방식을 결정.
- transition-delay : 전이 효과가 시작기 전까지 기다리는 시간.
- cubic-bezier : transition 운동을 나타내는 그래프를 설정할 수 있음.
  - https://cubic-bezier.com/#.25,.1,.25,1

# CSS animation
- 두 스타일 간의 애니매이션을 지정하는 단축어.

### @keyFrames
- 애니메이션의 중간 단계 styles을 지정할 수 있는 키워드.
- 예시
  ```
  @keyframes sample-ani {
      0% {
        transform: translate(0, 0);
      }
      50% {
        transform: translate(300px, 0);
        background-color: brown;
      }
      100% {
        transform: translate(400px, 500px);
      }
    }
  ```
### animation-direction
- 애니메이션이 앞, 뒤, 번갈아 실행되는지 결정하는 키워드
- 값
  - alternate : 번갈아 실행됨
  - reverse : 마지막에서 시작함
  - alternate-reverse : 마지막에서 시작하고 번갈아 실행됨.
  - etc..

### animation-fill-mode
- CSS 애니메이션 실행 전 후에 스타일을 어떻게 적용할지 지정할 수 있음. 
- 값
  - forwards : 실행 후 마지막 keyframe 값에서 멈춤..
  - etc..

### animation-play-state
- 애니메이션이 실행될지 여부를 결정할 수 있음
- 값
  - running
  - paused