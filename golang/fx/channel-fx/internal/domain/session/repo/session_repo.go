package repo

import (
	"context"

	"example.com/fx-demo/internal/domain/session/model"
)

type SessionRepository interface {
	Create(ctx context.Context, session *model.Session) (*model.Session, error)
	Get(ctx context.Context, id string) (*model.Session, error)
	DBType() string
}
