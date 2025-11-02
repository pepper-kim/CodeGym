Ref: https://go.dev/tour/moretypes/26
```
package main

import "fmt"

// fibonacci is a function that returns
// a function that returns an int.
func fibonacci() func() int {
	values := []int{}
	return func() int {
		if len(values) == 0 || len(values) == 1 {
			values = append(values, 1)
		} else {
			NMinus1Idx := len(values) - 1
			NMinus2Idx := len(values) - 2
			values = append(values, values[NMinus1Idx] + values[NMinus2Idx])
		}
		return values[len(values) - 1]
	}
}

func main() {
	f := fibonacci()
	for i := 0; i < 10; i++ {
		fmt.Print(f())
		fmt.Print(" ")
	}
}

// 출력
// 1 1 2 3 5 8 13 21 34 55 
```
