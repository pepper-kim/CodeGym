package svc

import (
	"context"

	"example.com/fx-demo/internal/domain/account/model"
)

type AccountManageSvc interface {
	Create(ctx context.Context, account *model.Account) (*model.Account, error)
	Get(ctx context.Context, id string) (*model.Account, error)
}


