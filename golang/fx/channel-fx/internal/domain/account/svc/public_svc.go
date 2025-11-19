package svc

import (
	"context"

	"example.com/fx-demo/internal/domain/account/model"
)

type Public struct {
	manageSvc AccountManageSvc
}

func NewPublic(
	manageSvc AccountManageSvc,
) *Public {
	return &Public{
		manageSvc: manageSvc,
	}
}

func (p *Public) CreateAccount(ctx context.Context, account *model.Account) (*model.Account, error) {
	return p.manageSvc.Create(ctx, account)
}

func (p *Public) GetAccount(ctx context.Context, id string) (*model.Account, error) {
	return p.manageSvc.Get(ctx, id)
}
