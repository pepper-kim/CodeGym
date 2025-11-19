package svc

import (
	"context"

	"example.com/fx-demo/internal/domain/account/model"
	"example.com/fx-demo/internal/domain/account/repo"
)

type accountManageSvcImpl struct {
	accountRepository repo.AccountRepository
}

func NewAccountManageSvcImpl(accountRepository repo.AccountRepository) AccountManageSvc {
	return &accountManageSvcImpl{accountRepository: accountRepository}
}

func (s *accountManageSvcImpl) Create(ctx context.Context, account *model.Account) (*model.Account, error) {
	return s.accountRepository.Create(ctx, account)
}

func (s *accountManageSvcImpl) Get(ctx context.Context, id string) (*model.Account, error) {
	return s.accountRepository.Get(ctx, id)
}
