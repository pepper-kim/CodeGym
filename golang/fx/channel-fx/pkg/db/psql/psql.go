package psql

import (
	"context"
	"fmt"
	"sync"

	"example.com/fx-demo/pkg/db"
)

type PostgresDB struct {
	mu     sync.RWMutex
	tables map[string]map[string]any
	// TODO: 실제 PostgreSQL 연결 구현
	// conn *pgx.Conn
}

func New() db.DB {
	return &PostgresDB{
		tables: make(map[string]map[string]any),
	}
}

func (pdb *PostgresDB) Create(ctx context.Context, table string, key string, value any) error {
	pdb.mu.Lock()
	defer pdb.mu.Unlock()

	if pdb.tables[table] == nil {
		pdb.tables[table] = make(map[string]any)
	}

	pdb.tables[table][key] = value
	// TODO: 실제 PostgreSQL INSERT 구현
	return nil
}

func (pdb *PostgresDB) Get(ctx context.Context, table string, key string) (any, error) {
	pdb.mu.RLock()
	defer pdb.mu.RUnlock()

	if pdb.tables[table] == nil {
		return nil, fmt.Errorf("table %s not found", table)
	}

	value, exists := pdb.tables[table][key]
	if !exists {
		return nil, fmt.Errorf("key %s not found in table %s", key, table)
	}

	// TODO: 실제 PostgreSQL SELECT 구현
	return value, nil
}

func (pdb *PostgresDB) DBType() string {
	return "postgres"
}
