package main

import (
	"context"
	"net"
	"net/http"

	"go.uber.org/fx"
	"go.uber.org/fx/fxevent"
	"go.uber.org/zap"
)

func main() {
	fx.New(
		fx.WithLogger(func(log *zap.Logger) fxevent.Logger {
			return &fxevent.ZapLogger{Logger: log}
		}),
		fx.Provide(
			NewHTTPServer, // *http.Server 타입을 반환하는 NewHTTPServer provider 등록
			NewServeMux,
			fx.Annotate(
				NewEchoHandler,
				fx.As(new(Route)),
			),
			zap.NewExample,
		),
		fx.Invoke(func(*http.Server) {}), // *http.Server를 의존성 그래프에 등록시키는 역할
	).Run()
}

func NewHTTPServer(lc fx.Lifecycle, mux *http.ServeMux, log *zap.Logger) *http.Server {
	srv := &http.Server{Addr: ":8080", Handler: mux}
	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			ln, err := net.Listen("tcp", srv.Addr)
			if err != nil {
				return err
			}

			log.Info("Starting HTTP server", zap.String("addr", srv.Addr))
			go srv.Serve(ln)
			return nil
		},
		OnStop: func(ctx context.Context) error {
			return srv.Shutdown(ctx)
		},
	})

	return srv
}

func NewServeMux(route Route) *http.ServeMux {
	mux := http.NewServeMux()
	mux.Handle(route.Pattern(), route)
	return mux
}
