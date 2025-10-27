```
package main

import (
	"golang.org/x/tour/wc"
	"fmt"
	"strings"
)

func WordCount(s string) map[string]int {
	words := strings.Fields(s)
	fmt.Println(s)
	fmt.Println(words)
	
	m := make(map[string]int)
	for _, w := range words {
		if _, ok := m[w]; ok {
			m[w] = m[w] + 1
		} else {
			m[w] = 1
		}
	}
	
	return m
}

func main() {
	wc.Test(WordCount)
}
```