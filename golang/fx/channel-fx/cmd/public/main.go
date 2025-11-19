package main

import (
	"context"
	"fmt"
	"log"

	"example.com/fx-demo/cmd/publicfx"
	accountRepo "example.com/fx-demo/internal/domain/account/repo"
	"example.com/fx-demo/internal/domain/account/svc"
	sessionRepo "example.com/fx-demo/internal/domain/session/repo"

	"go.uber.org/fx"
)

func main() {
	app := fx.New(
		publicfx.Public,

		fx.Invoke(runDemo),
	)

	if err := app.Start(context.Background()); err != nil {
		log.Fatal(err)
	}

	defer app.Stop(context.Background())
}

func runDemo(lc fx.Lifecycle, public *svc.Public, accountRepo accountRepo.AccountRepository, sessionRepo sessionRepo.SessionRepository) {
	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			fmt.Println("=== FX Dependency Injection Demo ===")
			fmt.Println()

			fmt.Printf("Account DB Type: %s\n", accountRepo.DBType())
			fmt.Printf("Session DB Type: %s\n", sessionRepo.DBType())

			return nil
		},
		OnStop: func(ctx context.Context) error {
			fmt.Println("=== Stopping the application ===")
			fmt.Println()

			return nil
		},
	})
}
