package main

import (
	"context"
	"fmt"
	"log"

	"go.uber.org/fx"
)

// a -> b -> c -> a

type A struct {
	B *B
}

func NewA() *A {
	return &A{
		B: nil,
	}
}

type B struct {
	C *C
}

func NewB() *B {
	return &B{
		C: nil,
	}
}

type C struct {
	A *A
}

func NewC() *C {
	return &C{
		A: nil,
	}
}

func main() {
	app := fx.New(
		fx.Provide(NewA),
		fx.Provide(NewB),
		fx.Provide(NewC),
		fx.Invoke(func(a *A, b *B, c *C) {
			a.B = b
			b.C = c
			c.A = a

			fmt.Println("=== Circular dependency Demo ===")
			fmt.Printf("A.B = %p\n", a.B)
			fmt.Printf("B.C = %p\n", b.C)
			fmt.Printf("C.A = %p\n", c.A)
			fmt.Printf("Full circle: A -> B -> C -> A: %p -> %p -> %p -> %p\n",
				a, a.B, a.B.C, a.B.C.A)
			fmt.Printf("Circular reference working: %v\n", a == a.B.C.A)
		}),
	)

	if err := app.Start(context.Background()); err != nil {
		log.Fatal(err)
	}
	defer app.Stop(context.Background())
}
