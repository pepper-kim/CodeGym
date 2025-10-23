# fx.New method
New(..) method에 fx와 함께 실행할 컴포넌트를 등록할 수 있음.

# App.Run method
앱을 실행 시키는 메소드. 앱이 stop signal을 받기 전까지 block됨. signal을 받은 이후엔 앱 자원을 정리하는 로직을 실행함.

# fx.Provide method
- 생성자들을 등록 시키는 함수. 애플리케이션에 인스턴스를 만드는 방법을 알려줌. 
- 여러 타입의 객체를 리턴하는 생성자를 등록할 수도 있음. 생성자는 다수의 파라미터를 받을 수도 있음. 
- Provide로 만들어진 인스턴스들은 기본적으로 캐싱되어 재사용될 수 있다. 싱글톤으로 활용됨. 
- Provide 주입 순서는 중요하지 않음(의존성 그래프를 먼저 생성하지 않을까 싶음).

### Reference
https://github.com/uber-go/fx/blob/6fab1b2d3a549a67dfcf50b96161a887181c2afa/provide.go#L50

# Reference
https://uber-go.github.io/fx/get-started/minimal.html