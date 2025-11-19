# json/v2

## json/v1 vs json/v2

> https://pkg.go.dev/encoding/json/v2 

> https://pkg.go.dev/encoding/json/v2#hdr-Security_Considerations 

> https://github.com/go-json-experiment/json?tab=readme-ov-file#behavior-changes

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

### omitempty 옵션의 동작성 변경
> https://github.com/go-json-experiment/json?tab=readme-ov-file#behavior-changes

v1에선 Go 관점에의 zero 값과(Go 타입 시스템의 기본 값) JSON 관점에서의 Empty 값을 모두 omitempty에서 빈 값으로 처리함. 그에 반해 v2에선 JSON 관점에서의 Empty 값만 omitempty에서 처리함. 즉 empty와 zero의 개념을 명확히 하는 구현이 v2이다. 그 결과 v2에서는 bool false과 int 0과 같은 값을 의미 있다고 여길 수 있다(원래는 omitempty에서 생략됨). 

#### Zero value(Go 관점)
- Go 타입 시스템에서의 기본값
- bool: false
- int: 0
- string: ""
- pointer: nil
- slice/map: nil (not allocated)

#### Empty JSON value(JSON 관점)
- JSON으로 직렬화 했을 때 "비어있는" 값
- null
- ""(empty string)
- [](empty array)
- {}(empty object)

#### 핵심 차이
```
// Zero이지만 Empty가 아닌 경우
bool:   false
int:    0

// Zero이면서 Empty인 경우
string: ""
slice:  nil
map:    nil

// Empty이지만 Zero가 아닌 경우
slice:  []string{}        // allocated but empty
map:    map[string]string{} // allocated but empty
```

예시 코드입니다.
```golang
type Example struct {
	BoolField   bool              `json:"bool_field,omitempty"`
	IntField    int               `json:"int_field,omitempty"`
	StringField string            `json:"string_field,omitempty"`
	PtrField    *string           `json:"ptr_field,omitempty"`
	SliceField  []string          `json:"slice_field,omitempty"`
	MapField    map[string]string `json:"map_field,omitempty"`
}

type ExampleWithOmitZero struct {
	BoolField   bool              `json:"bool_field,omitzero"`
	IntField    int               `json:"int_field,omitzero"`
	StringField string            `json:"string_field,omitzero"`
	PtrField    *string           `json:"ptr_field,omitzero"`
	SliceField  []string          `json:"slice_field,omitzero"`
	MapField    map[string]string `json:"map_field,omitzero"`
}

func main() {
	// 모든 필드가 zero value인 경우
	zeroValue := Example{}

	fmt.Println("\n================================")
	fmt.Println("========= Zero Values ==========")
	fmt.Println("================================")
	v1Result, _ := json.Marshal(zeroValue)
	fmt.Printf("v1 omitempty: %s\n", v1Result)

	v2Result, _ := jsonv2.Marshal(zeroValue)
	fmt.Printf("v2 omitempty: %s\n", v2Result)

	v2ZeroExample := ExampleWithOmitZero{}
	v2ZeroResult, _ := jsonv2.Marshal(v2ZeroExample)
	fmt.Printf("v2 omitzero: %s\n", v2ZeroResult)

	fmt.Println("\n================================")
	fmt.Println("====== Empty JSON Values =======")
	fmt.Println("================================")
	emptyJSONValues := Example{
		StringField: "",
		SliceField:  []string{},
		MapField:    map[string]string{},
	}

	v1Empty, _ := json.Marshal(emptyJSONValues)
	fmt.Printf("v1 omitempty: %s\n", v1Empty)
	// 출력: {}

	v2Empty, _ := jsonv2.Marshal(emptyJSONValues)
	fmt.Printf("v2 omitempty: %s\n", v2Empty)
	// 출력: {}

	v2EmptyZero := ExampleWithOmitZero{
		StringField: "",
		SliceField:  []string{},
		MapField:    map[string]string{},
	}
	v2EmptyZeroResult, _ := jsonv2.Marshal(v2EmptyZero)
	fmt.Printf("v2 omitzero: %s\n", v2EmptyZeroResult)
	// 출력: {}

	fmt.Println("\n================================")
	fmt.Println("=== Key Difference: false, 0 ===")
	fmt.Println("================================")
	nonEmptyJSON := Example{
		BoolField: false,
		IntField:  0,
	}

	v1NonEmpty, _ := json.Marshal(nonEmptyJSON)
	fmt.Printf("v1 omitempty (false, 0): %s\n", v1NonEmpty)
	// 출력: {}

	v2NonEmpty, _ := jsonv2.Marshal(nonEmptyJSON)
	fmt.Printf("v2 omitempty (false, 0): %s\n", v2NonEmpty)
	// 출력: {"bool_field":false,"int_field":0}

	v2NonEmptyZero := ExampleWithOmitZero{
		BoolField: false,
		IntField:  0,
	}
	v2NonEmptyZeroResult, _ := jsonv2.Marshal(v2NonEmptyZero)
	fmt.Printf("v2 omitzero (false, 0): %s\n", v2NonEmptyZeroResult)
	// 출력: {}
}
```

실행 결과
```
➜  encoding git:(main) ✗ go run .

================================
========= Zero Values ==========
================================
v1 omitempty: {}
v2 omitempty: {"bool_field":false,"int_field":0}
v2 omitzero: {}

================================
====== Empty JSON Values =======
================================
v1 omitempty: {}
v2 omitempty: {"bool_field":false,"int_field":0}
v2 omitzero: {"slice_field":[],"map_field":{}}

================================
=== Key Difference: false, 0 ===
================================
v1 omitempty (false, 0): {}
v2 omitempty (false, 0): {"bool_field":false,"int_field":0}
v2 omitzero (false, 0): {}
```

### string 옵션의 동작성 변경1
string 옵션이 numeric 타입에만 적용되고 재귀적으로 동작하도록 변경됨. 실제로 string 옵션을 쓰는 경우는 큰 정수를 precision loss 없이 전달하기 위함. Javascript의 Number.MAX_SAFE_INTEGER 보다 큰 int64 값을 안전하게 전달하기 위해서 v2는 numeric에만 집중함.

```golang
type LineItem struct {
	ItemID   int64   `json:"item_id"`
	Quantity int     `json:"quantity"`
	Price    float64 `json:"price"`
}

type Order struct {
	// 기본 타입들
	OrderID int64  `json:"order_id,string"`
	Name    string `json:"name,string"`   // v2에서는 효과 없음
	Active  bool   `json:"active,string"` // v2에서는 효과 없음

	// 슬라이스, 맵
	Amounts []float64        `json:"amounts,string"`
	Prices  map[string]int64 `json:"prices,string"`

	// 중첩 구조체
	Items   []LineItem          `json:"items,string"`
	Pricing map[string]LineItem `json:"pricing,string"`

	// 인터페이스
	Data interface{} `json:"data,string"`
}

func main() {
	order := Order{
		OrderID: 9007199254740992,
		Name:    "Special Order",
		Active:  true,
		Amounts: []float64{100.50, 200.75},
		Prices: map[string]int64{
			"item1": 9007199254740992,
			"item2": 9007199254740993,
		},
		Items: []LineItem{
			{ItemID: 9007199254740992, Quantity: 2, Price: 100.50},
			{ItemID: 9007199254740993, Quantity: 1, Price: 200.75},
		},
		Pricing: map[string]LineItem{
			"standard": {ItemID: 9007199254740994, Quantity: 1, Price: 99.99},
			"premium":  {ItemID: 9007199254740995, Quantity: 1, Price: 199.99},
		},
		Data: int64(9007199254740996),
	}

	fmt.Println("=== v1 Behavior ===")
	v1Result, _ := json.Marshal(order)
	fmt.Printf("%s\n\n", v1Result)
	// string, bool도 인코딩, slice/map 내부는 적용 안됨

	fmt.Println("=== v2 Behavior ===")
	v2Result, _ := jsonv2.Marshal(order)
	fmt.Printf("%s\n\n", v2Result)
	// numeric만 인코딩, 재귀적으로 모든 numeric에 적용

	fmt.Println("=== Key Differences ===")
	fmt.Println("1. Name (string):")
	fmt.Println("   v1: \"\\\"Special Order\\\"\" (escaped)")
	fmt.Println("   v2: \"Special Order\" (normal)")

	fmt.Println("\n2. Active (bool):")
	fmt.Println("   v1: \"true\" (stringified)")
	fmt.Println("   v2: true (normal)")

	fmt.Println("\n3. Amounts ([]float64):")
	fmt.Println("   v1: [100.5, 200.75] (numbers)")
	fmt.Println("   v2: [\"100.5\", \"200.75\"] (strings)")

	fmt.Println("\n4. Items[].ItemID (nested struct numeric):")
	fmt.Println("   v1: 9007199254740992 (number)")
	fmt.Println("   v2: \"9007199254740992\" (string)")

	fmt.Println("\n5. Data (interface{} with int64):")
	fmt.Println("   v1: 9007199254740996 (number)")
	fmt.Println("   v2: \"9007199254740996\" (string)")
}
```

실행 결과
```
➜  encoding git:(main) ✗ go run .
=== v1 Behavior ===
{"order_id":"9007199254740992","name":"\"Special Order\"","active":"true","amounts":[100.5,200.75],"prices":{"item1":9007199254740992,"item2":9007199254740993},"items":[{"item_id":9007199254740992,"quantity":2,"price":100.5},{"item_id":9007199254740993,"quantity":1,"price":200.75}],"pricing":{"premium":{"item_id":9007199254740995,"quantity":1,"price":199.99},"standard":{"item_id":9007199254740994,"quantity":1,"price":99.99}},"data":9007199254740996}

=== v2 Behavior ===
{"order_id":"9007199254740992","name":"Special Order","active":true,"amounts":["100.5","200.75"],"prices":{"item1":"9007199254740992","item2":"9007199254740993"},"items":[{"item_id":"9007199254740992","quantity":"2","price":"100.5"},{"item_id":"9007199254740993","quantity":"1","price":"200.75"}],"pricing":{"standard":{"item_id":"9007199254740994","quantity":"1","price":"99.99"},"premium":{"item_id":"9007199254740995","quantity":"1","price":"199.99"}},"data":"9007199254740996"}

=== Key Differences ===
1. Name (string):
   v1: "\"Special Order\"" (escaped)
   v2: "Special Order" (normal)

2. Active (bool):
   v1: "true" (stringified)
   v2: true (normal)

3. Amounts ([]float64):
   v1: [100.5, 200.75] (numbers)
   v2: ["100.5", "200.75"] (strings)

4. Items[].ItemID (nested struct numeric):
   v1: 9007199254740992 (number)
   v2: "9007199254740992" (string)

5. Data (interface{} with int64):
   v1: 9007199254740996 (number)
   v2: "9007199254740996" (string)
```

#### v1 -> v2로 마이그레이션 시 주의 사항
v1으로 marshal되어 저장된 값이 v2로 unmarshal 될 경우에 에러가 발생함.
반대로, v2로 marshal되어 저장된 값이 v1으로 unmarshal 될 경우 에러가 발생함.
```golang

type Product struct {
	ID     int64   `json:"id,string"`
	Name   string  `json:"name,string"`
	Active bool    `json:"active,string"`
	Price  float64 `json:"price,string"`
}

func main() {
	product := Product{
		ID:     123,
		Name:   "Laptop",
		Active: true,
		Price:  999.99,
	}

	fmt.Println("원본 데이터:")
	fmt.Printf("  ID=%d, Name=%q, Active=%v, Price=%.2f\n\n",
		product.ID, product.Name, product.Active, product.Price)

	// ========================================
	// Case 1: v1으로 marshal
	// ========================================
	v1JSON, _ := json.Marshal(product)
	fmt.Println("=== v1으로 marshal ===")
	fmt.Printf("%s\n\n", v1JSON)

	// v1 JSON을 v1으로 unmarshal
	var v1_v1 Product
	err1 := json.Unmarshal(v1JSON, &v1_v1)
	fmt.Println("[v1 JSON → v1 unmarshal]")
	fmt.Printf("err: %v\n", err1)
	fmt.Printf("ID=%d, Name=%q, Active=%v, Price=%.2f\n\n",
		v1_v1.ID, v1_v1.Name, v1_v1.Active, v1_v1.Price)

	// v1 JSON을 v2로 unmarshal
	var v1_v2 Product
	err2 := jsonv2.Unmarshal(v1JSON, &v1_v2)
	fmt.Println("[v1 JSON → v2 unmarshal]")
	fmt.Printf("err: %v\n", err2)
	fmt.Printf("ID=%d, Name=%q, Active=%v, Price=%.2f\n\n",
		v1_v2.ID, v1_v2.Name, v1_v2.Active, v1_v2.Price)

	// ========================================
	// Case 2: v2로 marshal
	// ========================================
	v2JSON, _ := jsonv2.Marshal(product)
	fmt.Println("=== v2로 marshal ===")
	fmt.Printf("%s\n\n", v2JSON)

	// v2 JSON을 v1으로 unmarshal
	var v2_v1 Product
	err3 := json.Unmarshal(v2JSON, &v2_v1)
	fmt.Println("[v2 JSON → v1 unmarshal]")
	fmt.Printf("err: %v\n", err3)
	fmt.Printf("ID=%d, Name=%q, Active=%v, Price=%.2f\n\n",
		v2_v1.ID, v2_v1.Name, v2_v1.Active, v2_v1.Price)

	// v2 JSON을 v2로 unmarshal
	var v2_v2 Product
	err4 := jsonv2.Unmarshal(v2JSON, &v2_v2)
	fmt.Println("[v2 JSON → v2 unmarshal]")
	fmt.Printf("err: %v\n", err4)
	fmt.Printf("ID=%d, Name=%q, Active=%v, Price=%.2f\n",
		v2_v2.ID, v2_v2.Name, v2_v2.Active, v2_v2.Price)
}
```

실행 결과
```
➜  encoding git:(main) ✗ go run .
원본 데이터:
  ID=123, Name="Laptop", Active=true, Price=999.99

=== v1으로 marshal ===
{"id":"123","name":"\"Laptop\"","active":"true","price":"999.99"}

[v1 JSON → v1 unmarshal]
err: <nil>
ID=123, Name="Laptop", Active=true, Price=999.99

[v1 JSON → v2 unmarshal]
err: json: cannot unmarshal JSON string into Go bool within "/active"
ID=123, Name="\"Laptop\"", Active=false, Price=0.00

=== v2로 marshal ===
{"id":"123","name":"Laptop","active":true,"price":"999.99"}

[v2 JSON → v1 unmarshal]
err: json: invalid use of ,string struct tag, trying to unmarshal "Laptop" into string
ID=123, Name="", Active=false, Price=0.00

[v2 JSON → v2 unmarshal]
err: <nil>
ID=123, Name="Laptop", Active=true, Price=999.99
```

### string 옵션의 동작성 변경2
Unmarshal 할 때 v2는 string이나 number를 둘 다 허용 함. 숫자를 string으로 변경하는 경우는 흔하기 때문에 이렇게 동작한다. 역직렬화 할 때는 다양한 케이스를 받을 수 있게 하고, 직렬화 할 때는 precision을 잃지 않는 방법을 선택했다.

> 🚨 중요: 내가 marshal할 때는 string으로 보내지만 unmarshal할 때는 둘다 받을게!

```golang
package main

import (
	"encoding/json"
	"fmt"

	jsonv2 "github.com/go-json-experiment/json"
)

type Product struct {
	ID *int64 `json:"id,string"`
}

func main() {
	// Case 1: API가 number로 보내는 경우
	jsonFromNumber := `{"id": 123}`

	// Case 2: API가 string으로 보내는 경우
	jsonFromString := `{"id": "123"}`

	// v1 동작
	var p1 Product
	json.Unmarshal([]byte(jsonFromNumber), &p1)
	v1Result, _ := json.Marshal(p1)
	fmt.Printf("[v1] jsonFromNumber result: %s\n", v1Result)

	json.Unmarshal([]byte(jsonFromString), &p1)
	v1Result, _ = json.Marshal(p1)
	fmt.Printf("[v1] jsonFromString result: %s\n\n", v1Result)

	// v2 동작
	var p2 Product
	jsonv2.Unmarshal([]byte(jsonFromNumber), &p2)
	v2Result, _ := json.Marshal(p2)
	fmt.Printf("[v2] jsonFromNumber result: %s\n", v2Result)

	jsonv2.Unmarshal([]byte(jsonFromString), &p2)
	v2Result, _ = json.Marshal(p2)
	fmt.Printf("[v2] jsonFromString result: %s\n", v2Result)
}
```

실행 결과
```
➜  encoding git:(main) ✗ go run .
[v1] jsonFromNumber result: {"id":null}
[v1] jsonFromString result: {"id":"123"}

[v2] jsonFromNumber result: {"id":"0"}
[v2] jsonFromString result: {"id":"123"}
```

실제 시나리오
```
// 내 Go 코드
type Response struct {
    UserID int64 `json:"user_id,string"`  // precision 문제 때문에 string으로 받음
}

// 외부 API들이 다르게 응답하는 경우
// API A: {"user_id": "9007199254740992"}  
// API B: {"user_id": 9007199254740992}

// v1: API B는 파싱 실패 (string만 받음)
// v2: 둘 다 파싱 성공 (유연함)
```

### string 옵션의 동작성 변경3
v1은 json 값에 "null" 문자열이 있을 경우에 때때로 nil로 해석함(혼란), v2는 항상 에러를 반환(명확). null이라는 문자열을 보내려면 "\"null\""을 값으로 보내는 것이 맞음.

```golang
package main

import (
	"encoding/json"
	"fmt"

	jsonv2 "github.com/go-json-experiment/json"
)

type Product struct {
	ID *int64 `json:"id,string"`
}

func main() {
	fmt.Println("=== Case 1: 정상적인 null ===")
	jsonNormal := `{"id": null}`

	var p1, p2 Product
	err1 := json.Unmarshal([]byte(jsonNormal), &p1)
	err2 := jsonv2.Unmarshal([]byte(jsonNormal), &p2)

	fmt.Printf("v1 unmarshal: err=%v, ID=%v\n", err1, p1.ID)
	fmt.Printf("v2 unmarshal: err=%v, ID=%v\n", err2, p2.ID)

	v1Result, _ := json.Marshal(p1)
	v2Result, _ := jsonv2.Marshal(p2)
	fmt.Printf("v1 marshal: %s\n", v1Result)
	fmt.Printf("v2 marshal: %s\n\n", v2Result)

	fmt.Println("=== Case 2: \"null\" 문자열 (잘못된 형식) ===")
	jsonNullString := `{"id": "null"}`

	var p3, p4 Product
	err3 := json.Unmarshal([]byte(jsonNullString), &p3)
	err4 := jsonv2.Unmarshal([]byte(jsonNullString), &p4)

	fmt.Printf("v1 unmarshal: err=%v, ID=%v\n", err3, p3.ID)
	fmt.Printf("v2 unmarshal: err=%v, ID=%v\n\n", err4, p4.ID)

	// 핵심: unmarshal 성공 여부를 확인하고 marshal
	if err3 == nil {
		v3Result, _ := json.Marshal(p3)
		fmt.Printf("v1 marshal: %s (\"null\" 문자열이 nil로 변환됨!)\n", v3Result)
	}

	if err4 == nil {
		v4Result, _ := jsonv2.Marshal(p4)
		fmt.Printf("v2 marshal: %s\n", v4Result)
	} else {
		fmt.Println("v2 marshal: 스킵 (unmarshal 실패했으므로)")
	}
}
```

실행 결과
```
➜  encoding git:(main) ✗ go run .
=== Case 1: 정상적인 null ===
v1 unmarshal: err=<nil>, ID=<nil>
v2 unmarshal: err=<nil>, ID=<nil>
v1 marshal: {"id":null}
v2 marshal: {"id":null}

=== Case 2: "null" 문자열 (잘못된 형식) ===
v1 unmarshal: err=<nil>, ID=<nil>
v2 unmarshal: err=json: cannot unmarshal JSON string "null" into Go int64 within "/id": invalid syntax, ID=0x14000118148

v1 marshal: {"id":null} ("null" 문자열이 nil로 변환됨!)
v2 marshal: 스킵 (unmarshal 실패했으므로)
```

### NilSlicesAndMaps
- v1: nil Go slice & map is marshaled as s JSON null.
- v2
  - nil Go slice array is marshaled as an empty JSON array
  - nil Go slice map is marshaled as an empty JSON object

```golang

type Data struct {
	Slice []string          `json:"slice"`
	Map   map[string]string `json:"map"`
}

func main() {
	fmt.Println("=== nil slice/map Marshal 차이 ===\n")

	// Case 1: nil slice, nil map
	nilData := Data{
		Slice: nil,
		Map:   nil,
	}

	fmt.Println("Input: nil slice, nil map")

	v1Result, _ := json.Marshal(nilData)
	fmt.Printf("v1: %s\n", v1Result)
	fmt.Println("   → slice: null, map: null\n")

	v2Result, _ := jsonv2.Marshal(nilData)
	fmt.Printf("v2: %s\n", v2Result)
	fmt.Println("   → slice: [], map: {}\n")

	// Case 2: empty slice, empty map (allocated)
	emptyData := Data{
		Slice: []string{},
		Map:   map[string]string{},
	}

	fmt.Println("Input: empty slice (allocated), empty map (allocated)")

	v1EmptyResult, _ := json.Marshal(emptyData)
	fmt.Printf("v1: %s\n", v1EmptyResult)
	fmt.Println("   → slice: [], map: {}\n")

	v2EmptyResult, _ := jsonv2.Marshal(emptyData)
	fmt.Printf("v2: %s\n", v2EmptyResult)
	fmt.Println("   → slice: [], map: {}\n")

	fmt.Println("   → slice: null, map: null (v1처럼 동작)\n")

	fmt.Println("=== 실제 비교표 ===\n")
	fmt.Println("┌──────────────┬─────────┬─────────┐")
	fmt.Println("│ Go Value     │   v1    │   v2    │")
	fmt.Println("├──────────────┼─────────┼─────────┤")
	fmt.Println("│ nil slice    │  null   │   []    │")
	fmt.Println("│ []string{}   │   []    │   []    │")
	fmt.Println("│ nil map      │  null   │   {}    │")
	fmt.Println("│ map[...]{}   │   {}    │   {}    │")
	fmt.Println("└──────────────┴─────────┴─────────┘\n")

	fmt.Println("=== 왜 이렇게 바뀌었나? ===")
	fmt.Println("1. JSON은 언어 독립적 → nil은 Go의 구현 디테일")
	fmt.Println("2. nil slice와 empty slice는 JSON 관점에서 같음 (둘 다 빈 배열)")
	fmt.Println("3. 다른 언어(JS, Python)로 전환 시 복잡도 감소")
	fmt.Println("4. v1 동작이 필요하면 format:emitnull 옵션 사용")

	fmt.Println("\n=== Unmarshal 동작 (v1, v2 동일) ===\n")

	// Unmarshal: null
	jsonNull := `{"slice":null,"map":null}`
	var d1, d2 Data

	json.Unmarshal([]byte(jsonNull), &d1)
	jsonv2.Unmarshal([]byte(jsonNull), &d2)

	fmt.Printf("Input: %s\n", jsonNull)
	fmt.Printf("v1 unmarshal: Slice=%v, Map=%v\n", d1.Slice, d1.Map)
	fmt.Printf("v2 unmarshal: Slice=%v, Map=%v\n\n", d2.Slice, d2.Map)

	// Unmarshal: empty
	jsonEmpty := `{"slice":[],"map":{}}`
	var d3, d4 Data

	json.Unmarshal([]byte(jsonEmpty), &d3)
	jsonv2.Unmarshal([]byte(jsonEmpty), &d4)

	fmt.Printf("Input: %s\n", jsonEmpty)
	fmt.Printf("v1 unmarshal: Slice=%v (len=%d), Map=%v (len=%d)\n",
		d3.Slice, len(d3.Slice), d3.Map, len(d3.Map))
	fmt.Printf("v2 unmarshal: Slice=%v (len=%d), Map=%v (len=%d)\n",
		d4.Slice, len(d4.Slice), d4.Map, len(d4.Map))
}
```
실행 결과
```
➜  encoding git:(main) ✗ go run .
=== nil slice/map Marshal 차이 ===

Input: nil slice, nil map
v1: {"slice":null,"map":null}
   → slice: null, map: null

v2: {"slice":[],"map":{}}
   → slice: [], map: {}

Input: empty slice (allocated), empty map (allocated)
v1: {"slice":[],"map":{}}
   → slice: [], map: {}

v2: {"slice":[],"map":{}}
   → slice: [], map: {}

   → slice: null, map: null (v1처럼 동작)

=== 실제 비교표 ===

┌──────────────┬─────────┬─────────┐
│ Go Value     │   v1    │   v2    │
├──────────────┼─────────┼─────────┤
│ nil slice    │  null   │   []    │
│ []string{}   │   []    │   []    │
│ nil map      │  null   │   {}    │
│ map[...]{}   │   {}    │   {}    │
└──────────────┴─────────┴─────────┘

=== 왜 이렇게 바뀌었나? ===
1. JSON은 언어 독립적 → nil은 Go의 구현 디테일
2. nil slice와 empty slice는 JSON 관점에서 같음 (둘 다 빈 배열)
3. 다른 언어(JS, Python)로 전환 시 복잡도 감소
4. v1 동작이 필요하면 format:emitnull 옵션 사용

=== Unmarshal 동작 (v1, v2 동일) ===

Input: {"slice":null,"map":null}
v1 unmarshal: Slice=[], Map=map[]
v2 unmarshal: Slice=[], Map=map[]

Input: {"slice":[],"map":{}}
v1 unmarshal: Slice=[] (len=0), Map=map[] (len=0)
v2 unmarshal: Slice=[] (len=0), Map=map[] (len=0)
```

### PointerReceiver
v1에선 ReferenceType에 null을 unmarshaling하면 값이 비워짐. 하지만 ValueType 필드에 null 값을 unmarshaling하면 값이 비워지지 않음. 그에 반해 v2는 모두 다 zero value로 바뀜.

```golang
package main

import (
	"encoding/json"
	"fmt"

	jsonv2 "github.com/go-json-experiment/json"
)

type Data struct {
	// nil 가능한 타입들
	Slice   []string          `json:"slice"`
	Map     map[string]string `json:"map"`
	Pointer *int              `json:"pointer"`
	Iface   interface{}       `json:"iface"`

	// nil 불가능한 타입들
	String string          `json:"string"`
	Int    int             `json:"int"`
	Bool   bool            `json:"bool"`
	Struct struct{ X int } `json:"struct"`
	Array  [2]int          `json:"array"`
}

func main() {
	fmt.Println("=== v1: nil 가능 여부에 따른 null 처리 ===\n")

	num := 42
	existing := Data{
		Slice:   []string{"a", "b"},
		Map:     map[string]string{"key": "val"},
		Pointer: &num,
		Iface:   "interface value",
		String:  "hello",
		Int:     100,
		Bool:    true,
		Struct:  struct{ X int }{X: 99},
		Array:   [2]int{1, 2},
	}

	fmt.Println("초기 데이터:")
	fmt.Printf("  Slice: %v\n", existing.Slice)
	fmt.Printf("  Map: %v\n", existing.Map)
	fmt.Printf("  Pointer: %v\n", derefInt(existing.Pointer))
	fmt.Printf("  Iface: %v\n", existing.Iface)
	fmt.Printf("  String: %q\n", existing.String)
	fmt.Printf("  Int: %d\n", existing.Int)
	fmt.Printf("  Bool: %v\n", existing.Bool)
	fmt.Printf("  Struct: %v\n", existing.Struct)
	fmt.Printf("  Array: %v\n\n", existing.Array)

	jsonWithNulls := `{
		"slice": null,
		"map": null,
		"pointer": null,
		"iface": null,
		"string": null,
		"int": null,
		"bool": null,
		"struct": null,
		"array": null
	}`

	// v1
	v1Data := existing
	json.Unmarshal([]byte(jsonWithNulls), &v1Data)

	fmt.Println("v1: 모든 필드에 null 전송")
	fmt.Println("\n[nil 가능한 타입 → 클리어됨]")
	fmt.Printf("  Slice: %v   ✓\n", v1Data.Slice)
	fmt.Printf("  Map: %v     ✓\n", v1Data.Map)
	fmt.Printf("  Pointer: %v ✓\n", v1Data.Pointer)
	fmt.Printf("  Iface: %v   ✓\n", v1Data.Iface)

	fmt.Println("\n[nil 불가능한 타입 → 무시됨 (기존 값 유지)]")
	fmt.Printf("  String: %q   ✗ (무시됨!)\n", v1Data.String)
	fmt.Printf("  Int: %d      ✗ (무시됨!)\n", v1Data.Int)
	fmt.Printf("  Bool: %v     ✗ (무시됨!)\n", v1Data.Bool)
	fmt.Printf("  Struct: %v   ✗ (무시됨!)\n", v1Data.Struct)
	fmt.Printf("  Array: %v    ✗ (무시됨!)\n\n", v1Data.Array)

	// v2
	v2Data := existing
	jsonv2.Unmarshal([]byte(jsonWithNulls), &v2Data)

	fmt.Println("v2: 모든 필드에 null 전송")
	fmt.Println("\n[모든 타입 → zero value로 클리어]")
	fmt.Printf("  Slice: %v\n", v2Data.Slice)
	fmt.Printf("  Map: %v\n", v2Data.Map)
	fmt.Printf("  Pointer: %v\n", v2Data.Pointer)
	fmt.Printf("  Iface: %v\n", v2Data.Iface)
	fmt.Printf("  String: %q\n", v2Data.String)
	fmt.Printf("  Int: %d\n", v2Data.Int)
	fmt.Printf("  Bool: %v\n", v2Data.Bool)
	fmt.Printf("  Struct: %v\n", v2Data.Struct)
	fmt.Printf("  Array: %v\n\n", v2Data.Array)
}

func derefInt(p *int) string {
	if p == nil {
		return "<nil>"
	}
	return fmt.Sprintf("%d", *p)
}
```

실행 결과
```
➜  encoding git:(main) ✗ go run .
=== v1: nil 가능 여부에 따른 null 처리 ===

초기 데이터:
  Slice: [a b]
  Map: map[key:val]
  Pointer: 42
  Iface: interface value
  String: "hello"
  Int: 100
  Bool: true
  Struct: {99}
  Array: [1 2]

v1: 모든 필드에 null 전송

[nil 가능한 타입 → 클리어됨]
  Slice: []   ✓
  Map: map[]     ✓
  Pointer: <nil> ✓
  Iface: <nil>   ✓

[nil 불가능한 타입 → 무시됨 (기존 값 유지)]
  String: "hello"   ✗ (무시됨!)
  Int: 100      ✗ (무시됨!)
  Bool: true     ✗ (무시됨!)
  Struct: {99}   ✗ (무시됨!)
  Array: [1 2]    ✗ (무시됨!)

v2: 모든 필드에 null 전송

[모든 타입 → zero value로 클리어]
  Slice: []
  Map: map[]
  Pointer: <nil>
  Iface: <nil>
  String: ""
  Int: 0
  Bool: false
  Struct: {0}
  Array: [0 0]
```


## How to acivate v2

가벼운 정도의 설명
크리티컬하게 설명해야 하는 부분을 나눠서 설명 해야하지 않을까(ex. 외부 서비스 의존하는 cafe24)

### 방법1: Go 1.25 사용

> https://go.dev/doc/go1.25#json_v2

Go 1.25에선 `encoding/json/v2`가 실험적인 패키지로 포함할 수 있다. 환경 변수 `GOEXPERIMENT=jsonv2`를 설정하면 `encoding/json/v2`과 `encoding/json/jsontext` 패키지를 활용할 수 있게 된다. 추가로 기존에 import한 `encoding/json` 패키지가 새로운 JSON 구현체를 사용하게 된다. 따라서 json/v2로 올리려면 환경 변수 `GOEXPERIMENT=jsonv2`를 설정하여 새로운 구현체 교체로 인한 문제가 있는지 미래 테스트해보는 것이 중요하다.
