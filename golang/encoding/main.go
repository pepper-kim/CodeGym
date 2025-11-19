package main

import (
	"fmt"

	json "github.com/go-json-experiment/json"
	"github.com/go-json-experiment/json/jsontext"
)

type Product struct {
	ID     int64   `json:"id,string"`
	Name   string  `json:"name,string"`
	Active bool    `json:"active,string"`
	Price  float64 `json:"price,string"`
}

type Data struct {
	Items []string          `json:"items,omitempty"`
	Meta  map[string]string `json:"meta,omitempty"`
}

func main() {
	fmt.Println("=== v2 기본 동작 ===\n")

	// StringifyWithLegacySemantics 테스트
	product := Product{
		ID:     123,
		Name:   "Laptop",
		Active: true,
		Price:  999.99,
	}

	v2DefaultJSON, _ := json.Marshal(product)
	fmt.Println("v2 기본 (numeric만 문자열화):")
	fmt.Printf("%s\n\n", v2DefaultJSON)

	// FormatNilSliceAsNull, FormatNilMapAsNull 테스트
	nilData := Data{
		Items: nil,
		Meta:  nil,
	}

	v2DefaultNilJSON, _ := json.Marshal(nilData)
	fmt.Println("v2 기본 (nil → 빈 배열/객체):")
	fmt.Printf("%s\n\n", v2DefaultNilJSON)

	fmt.Println("=== v1 호환 모드 설정 ===\n")

	// v1 완전 호환 모드 옵션
	v1CompatOptions := json.JoinOptions(
		json.FormatNilSliceAsNull(true),
		json.FormatNilMapAsNull(true),
		json.MatchCaseInsensitiveNames(true),
		jsontext.AllowDuplicateNames(true),
		jsontext.AllowInvalidUTF8(true),
	)

	// StringifyWithLegacySemantics 효과
	v1CompatJSON, _ := json.Marshal(product, v1CompatOptions)
	fmt.Println("v1 호환 모드 (bool/string도 문자열화):")
	fmt.Printf("%s\n\n", v1CompatJSON)

	// FormatNilSliceAsNull, FormatNilMapAsNull 효과
	v1CompatNilJSON, _ := json.Marshal(nilData, v1CompatOptions)
	fmt.Println("v1 호환 모드 (nil → null):")
	fmt.Printf("%s\n\n", v1CompatNilJSON)

	fmt.Println("=== 비교 결과 ===\n")
	fmt.Println("StringifyWithLegacySemantics:")
	fmt.Printf("  v2 기본:    %s\n", v2DefaultJSON)
	fmt.Printf("  v1 호환:    %s\n", v1CompatJSON)
	fmt.Println("  → bool/string도 문자열화됨")

	fmt.Println("\nFormatNilSliceAsNull & FormatNilMapAsNull:")
	fmt.Printf("  v2 기본:    %s\n", v2DefaultNilJSON)
	fmt.Printf("  v1 호환:    %s\n", v1CompatNilJSON)
	fmt.Println("  → nil이 null로 출력됨")

	fmt.Println("\n=== 결론 ===")
	fmt.Println("v1 호환 옵션을 사용하면 v2가 v1처럼 동작함")
	fmt.Println("마이그레이션 시 점진적으로 전환 가능")
}
