package sessionfx

import (
	"example.com/fx-demo/internal/domain/session/repo"
	"go.uber.org/fx"
)

var Session = fx.Options(
	sessionRepos,
)

var sessionRepos = fx.Options(
	fx.Provide(
		fx.Annotate(
			repo.NewSessionRepositoryImpl,
			fx.As(new(repo.SessionRepository)),
			fx.ParamTags(`name:"inmemory"`),
		),
	),
)
