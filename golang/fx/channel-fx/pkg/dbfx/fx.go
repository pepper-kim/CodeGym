package dbfx

import (
	"example.com/fx-demo/pkg/db"
	"example.com/fx-demo/pkg/db/inmemory"
	"example.com/fx-demo/pkg/db/psql"
	"go.uber.org/fx"
)

var Database = fx.Options(
	fx.Provide(
		fx.Annotate(
			inmemory.New,
			fx.As(new(db.DB)),
			fx.ResultTags(`name:"inmemory"`),
		),
	),
	fx.Provide(
		fx.Annotate(
			psql.New,
			fx.As(new(db.DB)),
			fx.ResultTags(`name:"postgres"`),
		),
	),
)
