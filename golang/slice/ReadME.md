# Slice란?
배열을 가리키는 view. slice는 조회의 기준이 될 배열 요소의 포인터(ptr)와 윈도우의 크기와(len) 포인터 부터 내부 배열의 마지막 요소까지의 개수(cap)로 이루어져 있다.

실제로 SliceHeader는 아래와 같이 정의돼 있다(https://pkg.go.dev/reflect#SliceHeader).
```
type SliceHeader struct {
  Data uintptr
  Len int
  Cap int
}
```

slice는 header(ptr, len, cap) 구조체 처럼 동작하며, 함수에 전달될 때 내부 배열(underlying array)이 전달되지 않고, 이 세 필드만 값으로 전달된다. 그 결과, 함수 안에서 slice를 수정하면 기존 배열에도 영향을 준다.

### Example-1
```
package main

import "fmt"

func main() {
	s := []int{2, 3, 5, 7, 11, 13}
	printSlice(s)

	// Extend its length.
	p := s[:4]
	printSlice(p)

	p[2] = 10
	printSlice(s)
	printSlice(p)
}


func printSlice(s []int) {
	fmt.Printf("len=%d cap=%d %v\n", len(s), cap(s), s)
}
```

### Output-1
```
len=6 cap=6 [2 3 5 7 11 13]
len=4 cap=6 [2 3 5 7]
len=6 cap=6 [2 3 10 7 11 13]
len=4 cap=6 [2 3 10 7]
```

ptr, len, cap의 관계를 이해하기 위해 슬라이스를 진행할 때 마다 내부 배열과 SliceHeader가 어떻게 변화는지 살펴보자.

### Example-2
```
package main

import "fmt"

func main() {
	s := []int{2, 3, 5, 7, 11, 13}
	printSlice(s)

	// Slice the slice to give it zero length.
	s = s[:0]
	printSlice(s)

	// Extend its length.
	s = s[:4]
	printSlice(s)

	// Drop its first two values.
	s = s[2:]
	printSlice(s)
}

func printSlice(s []int) {
	fmt.Printf("len=%d cap=%d %v\n", len(s), cap(s), s)
}
```

### Output-2
```
len=6 cap=6 [2 3 5 7 11 13]
len=0 cap=6 []
len=4 cap=6 [2 3 5 7]
len=2 cap=4 [5 7]
```

`s := []int{2, 3, 5, 7, 11, 13}`를 실행하면 아래와 같이 배열이 생성되고, slice는 배열의 시작 위치를 가리키는 포인터(ptr)와 길이(len), 용량(cap)을 갖는다.
```
underlying array (len=6 cap=6)
┌────┬────┬────┬────┬────┬────┐
│ 2  │ 3  │ 5  │ 7  │ 11 │ 13 │
└────┴────┴────┴────┴────┴────┘
▲
└── s.ptr (index 0)
len=6, cap=6, s = [2 3 5 7 11 13]
```

그 후 `s = s[:0]`를 실행 시 ptr 위치는 그대로인 채 len만 변한다. 다만 ptr부터 내부 배열의 끝 요소까지의 개수는 똑같기에 cap은 변화가 없다.
```
underlying array (len=6 cap=6)
┌────┬────┬────┬────┬────┬────┐
│ 2  │ 3  │ 5  │ 7  │ 11 │ 13 │
└────┴────┴────┴────┴────┴────┘
▲
└── s.ptr (index 0)
len=0, cap=6, s = []
```

`s = s[:4]`를 실행하면 ptr 위치는 그대로인 채 len만 바뀌므로 이전에선 안보였던 내부 배열 요소를 다시 볼 수 있게 된다.
```
underlying array (len=6 cap=6)
┌────┬────┬────┬────┬────┬────┐
│ 2  │ 3  │ 5  │ 7  │ 11 │ 13 │
└────┴────┴────┴────┴────┴────┘
▲
└── s.ptr (index 0)
len=4, cap=6, s = [2 3 5 7]
```

`s = s[2:]`를 실행 하면 ptr이 내부 배열 기준 index=2를 가리키도록 변경된다. 이때 len은 2가 되고 cap은 4가 된다. len이 변하는 이유는 기존의 슬라이스가 index=0~3까지 볼 수 있었으므로 새로운 슬라이스는 index=2~3만 볼 수 있기 때문이다. `s[2:]`는 기존 슬라이스의 시작점을 기준으로 offset을 계산하여 새로운 ptr을 정하고, len은 기존 슬라이스 길이에서 offset을 뺀 값, cap은 기존 cap에서 offset을 뺀 값으로 결정된다.
```
underlying array (len=6 cap=6)
┌────┬────┬────┬────┬────┬────┐
│ 2  │ 3  │ 5  │ 7  │ 11 │ 13 │
└────┴────┴────┴────┴────┴────┘
            ▲
            └── s.ptr (index 2)
len=2, cap=4, s = [5 7]
```




