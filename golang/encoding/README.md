# json/v2

## json/v1 vs json/v2

> https://pkg.go.dev/encoding/json/v2 > https://pkg.go.dev/encoding/json/v2#hdr-Security_Considerations > https://github.com/go-json-experiment/json?tab=readme-ov-file#behavior-changes

JSON은 서로 다른 언어로 작성된 시스템들이 데이터를 주고 받을 때 자주 사용된다. 그렇기에, 상호 운용성과 보안적인 이유로, 각 시스템들의 모든 json encoding 구현체가 데이터의 의미론적인 뜻에 대한 공통된 합의가 있어햐 한다.

하지만 encoding/json/v1과 encoding/json/v2는 입력을 다르게 처리하는 경우가 존재한다. 그렇기에 json/v1에서 json/v2로 마이그레이션 하기 전에 문제가 없을지 확인해야 한다.

v2 json 패키지는, API의 기본 동작들이 더 안전한 방향으로 구현하여, v1 보다 현명하게(sensible) 동작한다.

> The v2 API generally chooses more secure defaults than v1 [#](https://pkg.go.dev/encoding/json/v2#hdr-Security_Considerations)
> The v2 json package changes the default behavior of Marshal and Unmarshal relative to the v1 json package to be more sensible. [#](https://github.com/go-json-experiment/json?tab=readme-ov-file#behavior-changes)

### 1. 유효하지 않은 UTF8 이슈

표준에선 JSON이 UTF-8F로 인코딩 될 수 있어야 한다고 명시한다. 하지만 v1에선 UTF-8로는 유효하지 않은 바이트를 JSON String을 만들 때 Unicode로 대체한다. 그에 반해, v2에선 UTF-8에서 유효하지 않은 바이트를 거절한다. 더 엄격한 검증 절차를 거친다. v2에서의 기본 동작은 `jsontext.AllowInvalidUTF8` 옵션을 이용하여 바꿀 수 있다.

```golang
package main

import (
	"encoding/json"
	"fmt"

	jsonexp "github.com/go-json-experiment/json"
	"github.com/go-json-experiment/json/jsontext"
)

func main() {
	// 잘못된 UTF-8 바이트를 포함한 데이터
	// 0xff는 유효하지 않은 UTF-8 시퀀스
	invalidUTF8 := []byte(`{"name": "test` + string([]byte{0xff}) + `"}`)

	// v1의 동작: 잘못된 바이트를 유니코드 대체 문자(�)로 교체
	var v1Result map[string]string
	err := json.Unmarshal(invalidUTF8, &v1Result)
	if err == nil {
		fmt.Printf("v1 결과: %+v\n", v1Result)
		// 출력: v1 결과: map[name:test�]
		// 0xff가 � (U+FFFD)로 대체됨
	}

	// v2의 기본 동작: 잘못된 UTF-8 거부
	var v2Result map[string]string
	err = jsonexp.Unmarshal(invalidUTF8, &v2Result)
	if err != nil {
		fmt.Printf("v2 기본 에러: %v\n", err)
		// 에러 발생: invalid UTF-8
	}

	// v2에서 AllowInvalidUTF8 옵션 사용
	err = jsonexp.Unmarshal(invalidUTF8, &v2Result,
		jsontext.AllowInvalidUTF8(true))
	if err == nil {
		fmt.Printf("v2 (AllowInvalidUTF8): %+v\n", v2Result)
		// v1과 같이 대체 문자로 변환
	}
}
```

실행 결과

```
➜  encoding git:(main) ✗ go run .
v1 결과: map[name:test�]
v2 기본 에러: jsontext: invalid UTF-8 within "/name" after offset 14
v2 (AllowInvalidUTF8): map[name:test�]
```

### 2. JSON 중복 이름 처리 문제

표준에선 JSON 객체 안에 중복 이름이 존재할 경우 어떻게 처리할지에 대한 가이드라인이 없다. 즉, 각 시스템이 서로 다른 방식으로 구현한다면 그 동작성들도 달라질 수 있다는 뜻이다. v1에선 기본적으로 중복 이름을 허용하며 마지막 이름을 선택한다(psql의 `jsonb` 타입 처럼). 그에 반해 v2는 중복 이름을 거절한다. v2의 기본 동작은 `jsontext.AllowDuplicateNames` option으로 바꿀 수 있다.

> ⚠️ 주의: v1에서의 동작성을 인지하여 json 이름의 순서에 의지해선 안된다. 표준에선 JSON 객체를 순서가 없는 name/value 쌍으로 규정한다.

```golang
func main() {
	// 중복된 "name" 이름을 가진 JSON
	duplicateJSON := []byte(`{
			"name": "Alice",
			"age": 25,
			"name": "Bob"
	}`)

	// v1: 중복 허용, 나중 값으로 덮어씀
	var v1Result map[string]interface{}
	err := json.Unmarshal(duplicateJSON, &v1Result)
	if err != nil {
		fmt.Printf("v1 에러: %v\n", err)
	} else {
		fmt.Printf("v1 결과: %+v\n", v1Result)
	}

	// v2: 기본적으로 중복 거부
	var v2Result map[string]interface{}
	err = jsonexp.Unmarshal(duplicateJSON, &v2Result)
	if err != nil {
		fmt.Printf("v2 에러: %v\n", err)
	} else {
		fmt.Printf("v2 결과: %+v\n", v2Result)
	}

	// v2 + AllowDuplicateNames 옵션: v1처럼 동작
	err = jsonexp.Unmarshal(duplicateJSON, &v2Result,
		jsontext.AllowDuplicateNames(true))
	if err != nil {
		fmt.Printf("v2 (옵션) 에러: %v\n", err)
	} else {
		fmt.Printf("v2 (옵션) 결과: %+v\n", v2Result)
	}
}
```

실행 결과

```
➜  encoding git:(main) ✗ go run .
v1 결과: map[age:25 name:Bob]
v2 에러: jsontext: duplicate object member name "name"
v2 (옵션) 결과: map[age:25 name:Bob]
```

### 3. Case Sensitive name matching

표준에선 JSON 객체가 일반적으론 유니코드 포인트의 시퀀스의 동일성을 기반으로 매칭 해야 한다고 제안한다. 그 말은 즉슨, 이름을 비교할 때는 case sensitive 해야 한다. 하지만 v1에서 unmarshaling할 때 기본적으론 느슨한 case insensitve 매칭을 사용하고 v2에선 엄격한 case sensitive 매칭을 사용한다. case insensitive 매칭을 사용하는 것은 중복된 이름이 발생할 수 있는 다른 경로를 제공한다. case insensitive 매칭을 허용한다는 것은 v1이 다른 대부분의 JSON 구현체와 다른 방식으로 JSON 객체를 해석할 수 있음을 의미한다.

```golang

type Person struct {
	Name string `json:"name"`
	Age  int    `json:"age"`
}

func main() {
	// 대소문자가 다른 JSON 키
	mixedCaseJSON := []byte(`{
			"NAME": "Alice",
			"Age": 25
	}`)

	// v1: 대소문자 구분 안 함 (느슨한 매칭)
	var v1Result Person
	err := json.Unmarshal(mixedCaseJSON, &v1Result)
	if err != nil {
		fmt.Printf("v1 에러: %v\n", err)
	} else {
		fmt.Printf("v1 결과: %+v\n", v1Result)
		// 출력: v1 결과: {Name:Alice Age:25}
		// "NAME"이 "name"으로 매칭됨
	}

	// v2: 대소문자 구분 (엄격한 매칭)
	var v2Result Person
	err = jsonexp.Unmarshal(mixedCaseJSON, &v2Result)
	if err != nil {
		fmt.Printf("v2 에러: %v\n", err)
	} else {
		fmt.Printf("v2 결과: %+v\n", v2Result)
		// 출력: v2 결과: {Name: Age:25}
		// "NAME"은 "name"과 매칭 안 됨, Age만 매칭
	}

	// v2 + MatchCaseInsensitiveNames 옵션: v1처럼 동작
	err = jsonexp.Unmarshal(mixedCaseJSON, &v2Result,
		jsontext.AllowDuplicateNames(true))
	if err != nil {
		fmt.Printf("v2 (옵션) 에러: %v\n", err)
	} else {
		fmt.Printf("v2 (옵션) 결과: %+v\n", v2Result)
		// 출력: v2 (옵션) 결과: {Name:Alice Age:25}
		// 옵션을 주면 v1과 같이 대소문자 구분 안 함
	}
}
```

실행 결과

```
➜  encoding git:(main) ✗ go run .
v1 결과: {Name:Alice Age:25}
v2 결과: {Name: Age:0}
v2 (옵션) 결과: {Name: Age:0}
```

### HTML escape 문제

SetHTMLEscape 문제 ..

```golang
코드
```

실행 결과

```
출력
```

## How to acivate v2

### 방법1: Go 1.25 사용

> https://go.dev/doc/go1.25#json_v2

Go 1.25에선 `encoding/json/v2`가 실험적인 패키지로 포함할 수 있다. 환경 변수 `GOEXPERIMENT=jsonv2`를 설정하면 `encoding/json/v2`과 `encoding/json/jsontext` 패키지를 활용할 수 있게 된다. 추가로 기존에 import한 `encoding/json` 패키지가 새로운 JSON 구현체를 사용하게 된다. 따라서 json/v2로 올리려면 환경 변수 `GOEXPERIMENT=jsonv2`를 설정하여 새로운 구현체 교체로 인한 문제가 있는지 미래 테스트해보는 것이 중요하다.
