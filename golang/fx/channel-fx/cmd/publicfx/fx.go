package publicfx

import (
	"example.com/fx-demo/internal/domain/accountfx"
	"example.com/fx-demo/internal/domain/sessionfx"
	"example.com/fx-demo/pkg/dbfx"
	"go.uber.org/fx"
)

var Public = fx.Options(
	accountfx.Account,
	sessionfx.Session,

	dbfx.Database,
)
