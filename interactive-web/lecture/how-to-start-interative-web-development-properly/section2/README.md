# 3D
객체를 3D로 바라볼 땐 객체를 공간 안에 담아두고 그 공간에 perspective를 줘야 함. 이 설정으로 그 공간을 바라보는 카메라의 관점을 얻을 수 있음. 그렇기에 section2에서도 card를 넣어둘 world라는 공간을 설정함.

### 용어 정리
- em : 현재 요소의 font-size에 비례한 크기
- rem: root em. 부모가 아닌 root 요소를 기준으로 함.
- vw, vh : viewport의 너비와 높이에 상대적인 값
- viewport : 컴퓨터 그래픽스에서 뷰포트는 현재 보이는 다각형 영역(일반적으로 사각형)을 의미한다.
- perspective : z=0 평면과 유저 사이의 거리를 정의함. 3D 요소를 특정 관점으로 보는 것을 가능케 함.

### position
- 요소의 위치를 결정할 수 있음
- 종류
  - static
  - relative : 자신의 본래 위치에서 상대적인 위치를 설정할 때 지정.
  - fixed
  - absolute : position이 지정된 가장 가까운 부모를 기준으로 위치를 설정. 
  - sticky