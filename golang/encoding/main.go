package main

import (
	"encoding/json"
	"fmt"

	jsonv2 "github.com/go-json-experiment/json"
)

type Data struct {
	Hash [4]byte `json:"hash"`
}

type DataWithFormat struct {
	Hash [4]byte `json:"hash,format:array"`
}

func main() {
	data := Data{Hash: [4]byte{0xDE, 0xAD, 0xBE, 0xEF}}

	fmt.Println("=== Marshal ===")

	// v1: 숫자 배열로 출력
	v1Result, _ := json.Marshal(data)
	fmt.Printf("v1: %s\n", v1Result)
	// 출력: {"hash":[222,173,190,239]}

	// v2: base64로 출력 ([]byte와 동일하게)
	v2Result, _ := jsonv2.Marshal(data)
	fmt.Printf("v2: %s\n", v2Result)
	// 출력: {"hash":"3q2+7w=="}

	// v2 + format:array 옵션: v1처럼 동작
	dataWithFormat := DataWithFormat{Hash: [4]byte{0xDE, 0xAD, 0xBE, 0xEF}}
	v2FormatResult, _ := jsonv2.Marshal(dataWithFormat)
	fmt.Printf("v2 (format:array): %s\n\n", v2FormatResult)
	// 출력: {"hash":[222,173,190,239]}

	fmt.Println("=== Unmarshal ===")

	// v1 JSON (숫자 배열)
	v1JSON := `{"hash":[222,173,190,239]}`
	// v2 JSON (base64)
	v2JSON := `{"hash":"3q2+7w=="}`

	var d1, d2, d3, d4 Data

	json.Unmarshal([]byte(v1JSON), &d1)
	fmt.Printf("v1 unmarshal (숫자 배열): %v\n", d1.Hash)

	jsonv2.Unmarshal([]byte(v2JSON), &d2)
	fmt.Printf("v2 unmarshal (base64): %v\n", d2.Hash)

	// v2로 v1 형식 읽기 시도
	err := jsonv2.Unmarshal([]byte(v1JSON), &d3)
	fmt.Printf("v2 unmarshal (숫자 배열): err=%v\n", err)

	// v1으로 v2 형식 읽기 시도
	err = json.Unmarshal([]byte(v2JSON), &d4)
	fmt.Printf("v1 unmarshal (base64): err=%v\n", err)
}
