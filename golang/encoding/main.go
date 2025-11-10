package main

import (
	"encoding/json"
	"fmt"

	jsonexp "github.com/go-json-experiment/json"
	"github.com/go-json-experiment/json/jsontext"
)

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
