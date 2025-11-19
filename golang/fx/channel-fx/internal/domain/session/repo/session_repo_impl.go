package repo

import (
	"context"

	"example.com/fx-demo/internal/domain/session/model"
	"example.com/fx-demo/pkg/db"
)

type sessionRepositoryImpl struct {
	db db.DB
}

func NewSessionRepositoryImpl(db db.DB) SessionRepository {
	return &sessionRepositoryImpl{
		db: db,
	}
}

func (r *sessionRepositoryImpl) Create(ctx context.Context, session *model.Session) (*model.Session, error) {
	if err := r.db.Create(ctx, "sessions", session.ID, session); err != nil {
		return nil, err
	}

	return session, nil
}

func (r *sessionRepositoryImpl) Get(ctx context.Context, id string) (*model.Session, error) {
	session, err := r.db.Get(ctx, "sessions", id)
	if err != nil {
		return nil, err
	}

	return session.(*model.Session), nil
}

func (r *sessionRepositoryImpl) DBType() string {
	return "sessions"
}
