package repo

import (
	"context"

	"example.com/fx-demo/internal/domain/account/model"
	"example.com/fx-demo/pkg/db"
)

type accountRepositoryImpl struct {
	db db.DB
}

func NewAccountRepositoryImpl(db db.DB) AccountRepository {
	return &accountRepositoryImpl{
		db: db,
	}
}

func (r *accountRepositoryImpl) Create(ctx context.Context, account *model.Account) (*model.Account, error) {
	if err := r.db.Create(ctx, "accounts", account.ID, account); err != nil {
		return nil, err
	}

	return account, nil
}

func (r *accountRepositoryImpl) Get(ctx context.Context, id string) (*model.Account, error) {
	account, err := r.db.Get(ctx, "accounts", id)
	if err != nil {
		return nil, err
	}

	return account.(*model.Account), nil
}

func (r *accountRepositoryImpl) DBType() string {
	return r.db.DBType()
}
