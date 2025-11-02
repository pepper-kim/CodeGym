ref: https://go.dev/tour/methods/23
```
package main

import (
	"fmt"
	"io"
	"os"
	"strings"
)

type rot13Reader struct {
	r io.Reader
}

func (r13 rot13Reader) Read(output []byte) (int, error) {
	count, err := r13.r.Read(output)
	for i := range count {
		if !isAlphabet(output[i]) {
			continue
		}
		
		output[i] = convertByRot13(output[i])
	}
	return count, err
}

func main() {
	s := strings.NewReader("Lbh penpxrq gur pbqr!")
	r := rot13Reader{s}
	io.Copy(os.Stdout, &r)
}

func convertByRot13(alphabet byte) byte {
	ascii := int(alphabet)
	ilca := isLowerCaseAlphabet(ascii)
	if ilca {
		ascii -= 32
	}
	
	// 대문자라고 가정
	if isUpperCaseFront13(ascii) {
		ascii += 13
	} else {
		ascii -= 13
	}
	
	if ilca {
		ascii += 32
	}
	
	return byte(ascii)
}

func isAlphabet(ascii byte) bool {
	return isUpperCaseAlphabet(int(ascii)) || isLowerCaseAlphabet(int(ascii))
}

func isUpperCaseAlphabet(ascii int) bool {
	if ascii >= 65 && ascii <= 90 {
		return true
	}
	return false
}

func isLowerCaseAlphabet(ascii int) bool {
	if ascii >= 97 && ascii <= 122 {
		return true
	}
	return false
}

func isUpperCaseFront13(ascii int) bool {
	if ascii >= 65 && ascii <= 77 {
		return true
	}
	return false
}

func isLowerCaseFront13(ascii int) bool {
	if ascii >= 97 && ascii <= 109 {
		return true
	}
	return false
}
```
