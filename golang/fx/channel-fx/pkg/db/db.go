package db

import "context"

type DB interface {
	Create(ctx context.Context, table string, key string, value any) error
	Get(ctx context.Context, table string, key string) (any, error)
	DBType() string
}
