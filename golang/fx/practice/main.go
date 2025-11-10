package main

import (
	"fmt"

	"go.uber.org/fx"
)

func main() {
	fx.New(
		fx.Provide(
			fx.Annotate(
				NewHTTPClient1,
				fx.ResultTags(`group:"clients"`),
			),			
		),
		fx.Provide(
			fx.Annotate(
				NewHTTPClient2,
				fx.ResultTags(`group:"clients"`),
			),			
		),

		fx.Provide(
			fx.Annotate(
				NewRedisService,
				fx.ParamTags(`group:"clients"`),
			),
		),
		fx.Invoke(func(r *RedisService) {}),
	).Run()
}

type HTTPClient struct {
	fx.In,
	fx.Out,
}
func NewHTTPClient1() *HTTPClient {
	fmt.Println("---------------- NewHTTPClient1 called")
	return &HTTPClient{}
}

func NewHTTPClient2() *HTTPClient {
	fmt.Println("---------------- NewHTTPClient2 called")
	return &HTTPClient{}
}

type RedisService struct {}
func NewRedisService(clients []*HTTPClient) *RedisService {
	fmt.Println("---------------- NewRedisService called")
	fmt.Println("clients count:", len(clients))
	return &RedisService{}
}
