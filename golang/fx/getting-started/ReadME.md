# fx.New method
New(..) method에 fx와 함께 실행할 컴포넌트를 등록할 수 있음.

# App.Run method
앱을 실행 시키는 메소드. 앱이 stop signal을 받기 전까지 block됨. signal을 받은 이후엔 앱 자원을 정리하는 로직을 실행함.

# fx.Provide method
- 생성자들을 등록 시키는 함수. 애플리케이션에 인스턴스를 만드는 방법을 알려줌. 
- 여러 타입의 객체를 리턴하는 생성자를 등록할 수도 있음. 생성자는 다수의 파라미터를 받을 수도 있음. 
- Provide로 만들어진 인스턴스들은 기본적으로 캐싱되어 재사용될 수 있다. 싱글톤으로 활용됨. 
- Provide 주입 순서는 중요하지 않음(의존성 그래프를 먼저 생성하지 않을까 싶음).

# Annotations
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

type OpenAIService struct {}
func NewOpenAIService(client *HTTPClient) *OpenAIService {
	fmt.Println("---------------- NewOpenAIService called")
	return &OpenAIService{}
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
`name`이 아닌 `group`을 설정하면 value group에 값을 전달하고 소모할 수 있다.


### Casting structs to interfaces

### Reference
- https://github.com/uber-go/fx/blob/6fab1b2d3a549a67dfcf50b96161a887181c2afa/provide.go#L50


# Reference
- https://uber-go.github.io/fx/get-started/minimal.html
- https://uber-go.github.io/fx/annotate.html
- https://uber-go.github.io/fx/value-groups/index.html