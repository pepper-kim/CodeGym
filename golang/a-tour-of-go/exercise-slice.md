```
package main

import "golang.org/x/tour/pic"

func Pic(dx, dy int) [][]uint8 {
	p := make([][]uint8, dy)
	for i := range p {
		p[i] = make([]uint8, dx)

		for j := range p[i] {
			p[i][j] = uint8(i ^ j)
		}
	}

	return p
}

func main() {
	pic.Show(Pic)
}
```