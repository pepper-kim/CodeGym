# fx.New method
New(..) method에 fx와 함께 실행할 컴포넌트를 등록할 수 있음.

# App.Run method
앱을 실행 시키는 메소드. 앱이 stop signal을 받기 전까지 block됨. signal을 받은 이후엔 앱 자원을 정리하는 로직을 실행함.

# fx.Provide method
> https://github.com/uber-go/fx/blob/6fab1b2d3a549a67dfcf50b96161a887181c2afa/provide.go#L50

- 생성자들을 등록 시키는 함수. 애플리케이션에 인스턴스를 만드는 방법을 알려줌. 
- 여러 타입의 객체를 리턴하는 생성자를 등록할 수도 있음. 생성자는 다수의 파라미터를 받을 수도 있음. 
- Provide로 만들어진 인스턴스들은 기본적으로 캐싱되어 재사용될 수 있다. 싱글톤으로 활용됨. 
- Provide 주입 순서는 중요하지 않음(의존성 그래프를 먼저 생성하지 않을까 싶음).

# Annotations
> https://pkg.go.dev/go.uber.org/fx#Annotation
> https://uber-go.github.io/fx/annotate.html

Annotation을 이용하면 fx.Provide, fx.Invoke, fx.Supply 혹은 fx.Replace에 function과 값을 넘기기 전에 그것들에 대한 주석을 달 수 있다(=annotate).
이를 이용 시, 일반적인 Go 함수를 재사용하여, function이 parameter 혹은 result 객체를 사용하도록 의도적으로 설정하지 않아도, 아래 두가지를 할 수 있다.
- 'feed valuest to a value group'
- 'consume values from a value group'


## Annotating a function
자 그럼 Annotation을 이용하여 함수에 주석을 다는 법을 알아보자.
우선 두가지 함수 중 하나가 필요하다.
- 함수1: parameter object를 받지 않는 함수. fx.ParamTags를 이용해서 주석을 달 수 있다.
- 함수2: result object를 받지 않는 함수. fx.ResultTags를 이용해서 주석을 달 수 있다.

### fx tags with name
Parameter object를 받지 않는 일반적인 Go 함수에 주석을 달아보자.
1. 우선 해당 함수를 fx.Provide에 넣어보자.
  ```golang
  fx.Provide(
    NewHTTPClient,
  )
  ```
2. 다음으로, 해당 함수를 fx.Annotate로 감싸보자. 주석을 달 대상을 설정하는 행위다.
  ```golang
  fx.Provide(
    fx.Annotate(
      NewHTTPClient,
    )
  )
  ```
3. 마지막으로 주석을 전달하자. NewHTTPClient의 결과(Result) 값에 주석(Tag)를 달았다.
  ```golang
  fx.Provide(
    fx.Annotate(
      NewHTTPClient,
      fx.ResultTags(`name:"client"`)
    )
  )
  ```

다른 생성자에서 parameter 주입이 필요할 경우에 이를 적극 활용 할 수 있다.
예를 들어보자.
```golang
package main

import (
	"fmt"

	"go.uber.org/fx"
)

func main() {
	fx.New(
		fx.Provide(NewHTTPClient),

		fx.Provide(NewRedisService,),
		fx.Invoke(func(r *RedisService) {}),
	).Run()
}

type HTTPClient struct {}
func NewHTTPClient() *HTTPClient {
	fmt.Println("---------------- NewHTTPClient called")
	return &HTTPClient{}
}

type RedisService struct {}
func NewRedisService(client *HTTPClient) *RedisService {
	fmt.Println("---------------- NewRedisService called")
	return &RedisService{}
}
```

위 코드를 실행하면 서버가 정상적으로 실행되는 것을 확인할 수 있다.
```
apple@alstjrdl951-MacBookProM2 practice % go run .
[Fx] PROVIDE    fx.Lifecycle <= go.uber.org/fx.New.func1()
[Fx] PROVIDE    fx.Shutdowner <= go.uber.org/fx.(*App).shutdowner-fm()
[Fx] PROVIDE    fx.DotGraph <= go.uber.org/fx.(*App).dotGraph-fm()
[Fx] PROVIDE    *main.HTTPClient <= main.NewHTTPClient()
[Fx] PROVIDE    *main.RedisService <= main.NewRedisService()
[Fx] INVOKE             main.main.func1()
[Fx] BEFORE RUN provide: main.NewHTTPClient()
---------------- NewHTTPClient called
[Fx] RUN        provide: main.NewHTTPClient() in 193.125µs
[Fx] BEFORE RUN provide: main.NewRedisService()
---------------- NewRedisService called
[Fx] RUN        provide: main.NewRedisService() in 31.167µs
[Fx] RUNNING
```

하지만 `fx.ResultTags(`name:"client"`)`를 `fx.Annotate`에 추가하면,
```golang
...
func main() {
	fx.New(
		fx.Provide(
			fx.Annotate(
				NewHTTPClient,
				fx.ResultTags(`name:"client"`), // <--------- 추가!
			),			
		),

		fx.Provide(NewRedisService),
		fx.Invoke(func(r *RedisService) {}),
	).Run()
}
...
```

아래 로그를 얻게된다. 
`*main.HTTPClient (did you mean to Provide it?)`를 주목하자. `NewRedisService`를 생성하던 도중 실패했다. `*main.HTTPClient`를 찾는데 실패했기 때문이다.
`NewRedisService`가 찾는 값은 `ResultTags`가 안달린 기본 값이라는 것을 알 수 있다.
```
[Fx] PROVIDE    *main.HTTPClient[name = "client"] <= fx.Annotate(main.NewHTTPClient(), fx.ResultTags(["name:\"client\""])
[Fx] PROVIDE    *main.RedisService <= main.NewRedisService()
[Fx] INVOKE             main.main.func1()
[Fx] ERROR              fx.Invoke(main.main.func1()) called from:
main.main
        /Users/apple/Github/personal/CodeGym/golang/fx/practice/main.go:19
runtime.main
        /opt/homebrew/Cellar/go/1.25.3/libexec/src/runtime/proc.go:285
Failed: could not build arguments for function "main".main.func1
        /Users/apple/Github/personal/CodeGym/golang/fx/practice/main.go:19:
failed to build *main.RedisService:
missing dependencies for function "main".NewRedisService
        /Users/apple/Github/personal/CodeGym/golang/fx/practice/main.go:30:
missing type:
        - *main.HTTPClient (did you mean to Provide it?)
[Fx] ERROR              Failed to start: could not build arguments for function "main".main.func1
        /Users/apple/Github/personal/CodeGym/golang/fx/practice/main.go:19:
failed to build *main.RedisService:
missing dependencies for function "main".NewRedisService
        /Users/apple/Github/personal/CodeGym/golang/fx/practice/main.go:30:
missing type:
        - *main.HTTPClient (did you mean to Provide it?)
exit status 1
```

생성자의 결과 값에 `ResultTags`를 달았다면, 그 값을 주입 받고 싶은 경우엔 `ParamTags`를 이용해야 한다.
```golang
func main() {
	fx.New(
		fx.Provide(
			fx.Annotate(
				NewHTTPClient,
				fx.ResultTags(`name:"client"`),
			),			
		),

		fx.Provide(
			fx.Annotate(
				NewRedisService,
				fx.ParamTags(`name:"client"`),
			),
		),
		fx.Invoke(func(r *RedisService) {}),
	).Run()
}
```

문제 없이 실행된다.
```
[Fx] PROVIDE    *main.RedisService <= fx.Annotate(main.NewRedisService(), fx.ParamTags(["name:\"client\""])
[Fx] INVOKE             main.main.func1()
[Fx] BEFORE RUN provide: fx.Annotate(main.NewHTTPClient(), fx.ResultTags(["name:\"client\""])
---------------- NewHTTPClient called
[Fx] RUN        provide: fx.Annotate(main.NewHTTPClient(), fx.ResultTags(["name:\"client\""]) in 49.5µs
[Fx] BEFORE RUN provide: fx.Annotate(main.NewRedisService(), fx.ParamTags(["name:\"client\""])
---------------- NewRedisService called
[Fx] RUN        provide: fx.Annotate(main.NewRedisService(), fx.ParamTags(["name:\"client\""]) in 8.083µs
[Fx] RUNNING
```

### fx tags with group
> https://uber-go.github.io/fx/value-groups/index.html

`name`이 아닌 `group`을 설정하면 value group에 값을 전달하고 소모할 수 있다.

```golang
func main() {
	fx.New(
		fx.Provide(
			fx.Annotate(
				NewHTTPClient1,
				fx.ResultTags(`group:"clients"`),
			),			
		),
		fx.Provide(
			fx.Annotate(
				NewHTTPClient2,
				fx.ResultTags(`group:"clients"`),
			),			
		),

		fx.Provide(
			fx.Annotate(
				NewRedisService,
				fx.ParamTags(`group:"clients"`),
			),
		),
		fx.Invoke(func(r *RedisService) {}),
	).Run()
}

type HTTPClient struct {}
func NewHTTPClient1() *HTTPClient {
	fmt.Println("---------------- NewHTTPClient1 called")
	return &HTTPClient{}
}

func NewHTTPClient2() *HTTPClient {
	fmt.Println("---------------- NewHTTPClient2 called")
	return &HTTPClient{}
}

type RedisService struct {}
func NewRedisService(clients []*HTTPClient) *RedisService {
	fmt.Println("---------------- NewRedisService called")
	fmt.Println("clients count:", len(clients))
	return &RedisService{}
}
```

# Parameter Objects
> https://uber-go.github.io/fx/parameter-objects.html

Parameter Objects는 특정 함수 만을 위해 만든 파라미터 객체다. `user`와 같은 일반적인 객체가 아니라 `GetUser` 함수 만들 위하 사용할 수 있는 파라미터 객체다.
Fx에서 Parameter Objects는 공개(exported) 필드만을 포함하며 항상 `fx.In` 태그가 붙는다

### Parameter objects 사용 법
예로, 아래와 같이 `HTTPClientParams` 구조체를 선언 후 `fx.In` 태그를 붙이자.
```golang
type HTTPClientParams struct {
	fx.In
}
```

공개(exported) 필드를 추가하자.
```golang
type HTTPClientParams struct {
	fx.In

	Config HTTPClientConfig
}
```

그럼 아래와 같이 사용할 수 있다.
```golang
func NewHTTPClient(p HTTPClientParams) *HTTPClient {
	fmt.Println("---------------- NewHTTPClient1 called")
	return &HTTPClient{
		url: p.Config.URL
	}
}

type HTTPClientParams struct {
	fx.In

	Config HTTPClientConfig
}
```

Parameter Object를 사용하면 메소드에 새로운 파라미터를 추가하더라도 메소드 시그니처를 바꾸지 않아도 되는 장점이 생긴다(하위 호환성 보장). 그로 인해 메소드 파라미터 추가가 쉽고, 의존성 주입 시 매개변수를 깔끔하게 관리할 수 있다. 더불어, 모듈간의 결합도가 낮아지게 된다.

하위 호환성을 보장하기 위해 새로 추가하는 필드에는 `optional`을 설정하자. 이를 설정하면 DI로 주입할 해당 값이 없어도 프레임워크에서 오류를 내지 않는다. 개발자들은 nil 처리만 해주면 된다.
> https://pkg.go.dev/go.uber.org/fx#hdr-Optional_Dependencies
```golang
type HTTPClientParams struct {
	fx.In

	Config HTTPClientConfig
	Logger *zap.Logger `optional:"true"`
}

func NewHTTPClient(p HTTPClientParams) *HTTPClient {
	l := p.Logger
	if l == nil {
		l = zap.NewNop()
	}
	return &HTTPClient{
		url: p.Config.URL
		logger: l
	}
}
```

Parameter Objects가 빛을 발하는 순간은 ParamTags를 이용하여 DI 받을 객체가 많을 때다. Register 함수는 fx.Lifecycle을 받는다. fx의 기본 Lifecycle 객체다.
Register 함수를 Invoke하려면 fx.ParamTags의 fx.Lifecycle 인자가 들어오는 곳에 빈 문자열 즉 기본 값이 들어오도록 설정 해주어야 한다. 가독성이 매우 떨어진다.
```golang
func Register(lc fx.Lifecycle, starters []Starter, stoppers []Stopper) {
	registerStartHooks(lc, starters)
	registerStopHooks(lc, stoppers)
}

func main() {
	fx.New(
		fx.Invoke(
			fx.Annotate(
				Register,
				fx.ParamTags(``, `group:"starters"`, `group:"stoppers"`),
			),
	),
	).Run()
}
```

이 때 RegisterParams를 사용하면 코드가 훨씬 깔끔해진다.
```golang
func Register(p RegisterParams) {
	registerStartHooks(p.LC, p.Starters)
	registerStopHooks(p.LC, p.Stoppers)
}

type RegisterParams struct {
	fx.In

	LC fx.Lifecycle 
	Starters []Starter	`group:"starters"` 
	Stoppers []Stopper	`group:"stoppers"`
}

func main() {
	fx.New(
		fx.Invoke(Register),
	).Run()
}
```

> 💡 **Tip:** 모든 생성자 마다 Parameter Object 패턴을 사용할 필요는 없다 인자가 많을 경우(3개 이상)에만 사용하는 것이 좋다고 생각한다. 혹은 앞으로 확장될 가능성이 높을 때도 유용하다.

# Result Objects
> https://uber-go.github.io/fx/result-objects.html
> https://pkg.go.dev/go.uber.org/fx#hdr-Result_Structs

함수의 결과 값들이 많을 결우엔 Result Objects를 사용할 수 있다. 함수의 결과 값을 하나의 구조체로 관리할 수 있어 상하위 호환성을 보장할 수 있다. 함수가 응답할 구조체를 선언 후 `fx.Out`를 enbedding하면 fx는 이를 Result Objects로 판명한다.

예를 들어 아래와 같이 응답 값이 많은 경우에,
```golang
func SetupGateways(conn *sql.DB) (*UserGateway, *CommentGateway, *PostGateway, error) {
	...
}
```

Result Objects `Gateways`를 선언하면 코드가 깔끔해진다.
```golang
func SetupGateways(conn *sql.DB) (Gateways, error) {
	...
}

type Gateways struct {
	fx.Out

	Users 		*UserGateway
	Comments 	*CommentGateway
	Posts 		*PostGateway
}
```

### Reference
- https://github.com/uber-go/fx/blob/6fab1b2d3a549a67dfcf50b96161a887181c2afa/provide.go#L50


# 이외 Reference
- https://uber-go.github.io/fx/get-started/minimal.html