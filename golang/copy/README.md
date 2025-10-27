# copy() 함수
input 값들을 destination에 최대한 복사하는 함수. `copy(destination, input)` 형태로 쓰임. 최대한 복사하려 하기에, 기존 슬라이스가 복사하려는 슬라이스보다 커도 복사하려는 슬라이스가 자동으로 확장되지 않는다. 예를 들어 아래 코드 실행 시 `a2`의 값들 중 `a1` 슬라이스의 크기만큼만 `a1`에 복사되는 것을 확인할 수 있다.

### example-1
```
package main

import "fmt"
 
func main() {
	a1 := []int{1}
	a2 := []int{-1, -2}
	a5 := []int{10, 11, 12, 13, 14}

	fmt.Println("a1", a1)
	fmt.Println("a2", a2)
	fmt.Println("a5", a5)

	// copy(destination, input)
	// len(a2) > len(a1)
	copy(a2, a1)
	fmt.Println("a1", a1)
	fmt.Println("a2", a2)
}
```
### output-1
```
a1 [1]
a2 [-1 -2]
a3 [10 11 12 13 14]
a1 [-1]
a2 [-1 -2]
```