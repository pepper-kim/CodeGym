package accountfx

import (
	"example.com/fx-demo/internal/domain/account/repo"
	accountSvc "example.com/fx-demo/internal/domain/account/svc"
	"go.uber.org/fx"
)

var Account = fx.Options(
	accountSvcs,
)

var accountSvcs = fx.Options(
	fx.Provide(
		fx.Annotate(
			accountSvc.NewAccountManageSvcImpl,
			fx.As(new(accountSvc.AccountManageSvc)),
		),
		fx.Annotate(
			repo.NewAccountRepositoryImpl,
			fx.As(new(repo.AccountRepository)),
			fx.ParamTags(`name:"postgres"`),
		),
	),
	fx.Provide(accountSvc.NewPublic),
)
