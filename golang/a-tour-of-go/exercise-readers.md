ref: https://go.dev/tour/methods/22
```
package main

import "golang.org/x/tour/reader"

type MyReader struct{}

func (mR MyReader) Read(output []byte) (int, error) {
	for i, _ := range output {
		output[i] = 'A'
	}
	return len(output), nil
}

func main() {
	reader.Validate(MyReader{})
}
```
