# Closer란?
Lexical environment를 기억하고 있는 함수. 함수가 선언 됐을 때의 scope를 기억하고 있는 함수다. 그렇기에 클로저는 외부 함수의 변수를 기억하고 참조할 수 있다.

예를 들어, `adder` 함수는 `func(x int) int` 함수를 리턴한다. 이때 `func(x int) int` 함수는 `sum` 변수를 참조할 수 있다. 그 함수가 선언 될 때 같은 스코프에 있었기에 참조가 가능하다. 이렇게 런타임이 아니라 컴파일 타임, 언어가 작성됐을 때(lexical=어휘의),의 스코프를 기억하는 함수를 Closer라고 부른다.

```
package main

import "fmt"

func adder() func(int) int {
	sum := 0
	return func(x int) int {
		sum += x
		return sum
	}
}

func main() {
	pos, neg := adder(), adder()
	for i := 0; i < 10; i++ {
		fmt.Println(
			pos(i),
			neg(-2*i),
		)
	}
}
```

### 개인 생각
Closer는 React `Component`의 `useState`를 연상시킨다. React에서 `Component`는 `html을` 반환하는 함수다. `useState`는 `Component` 안에서 변수를 재활용할 수 있게 한다. 함수를 다시 호출해도 변수를 다시 선언하지 않는다. 기존 값을 기억하여 활용할 수 있다. 함수가 선언된 시점에서의 변수를 기억하게 한다는 점에서 Closer는 리액트 컴포넌트의 `useState`와 유사하다. 적다보니 `useCallback`도 함수형 Closer로 보인다.
