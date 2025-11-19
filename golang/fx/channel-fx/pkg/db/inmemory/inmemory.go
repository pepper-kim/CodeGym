package inmemory

import (
	"context"
	"fmt"
	"sync"

	"example.com/fx-demo/pkg/db"
)

type InMemoryDB struct {
	mu     sync.RWMutex
	tables map[string]map[string]any
}

func New() db.DB {
	return &InMemoryDB{
		tables: make(map[string]map[string]any),
	}
}

func (db *InMemoryDB) Create(ctx context.Context, table string, key string, value any) error {
	db.mu.Lock()
	defer db.mu.Unlock()

	if db.tables[table] == nil {
		db.tables[table] = make(map[string]any)
	}

	db.tables[table][key] = value
	return nil
}

func (db *InMemoryDB) Get(ctx context.Context, table string, key string) (any, error) {
	db.mu.RLock()
	defer db.mu.RUnlock()

	if db.tables[table] == nil {
		return nil, fmt.Errorf("table %s not found", table)
	}

	return db.tables[table][key], nil
}

func (db *InMemoryDB) DBType() string {
	return "inmemory"
}
