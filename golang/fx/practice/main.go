package main

import (
	"fmt"

	"go.uber.org/fx"
)

func main() {
	fx.New(
		fx.Provide(
			fx.Annotate(
				NewHTTPClient,
				fx.ResultTags(`name:"client"`),
			),			
		),

		fx.Provide(
			fx.Annotate(
				NewRedisService,
				fx.ParamTags(`name:"client"`),
			),
		),
		fx.Invoke(func(r *RedisService) {}),
	).Run()
}

type HTTPClient struct {}
func NewHTTPClient() *HTTPClient {
	fmt.Println("---------------- NewHTTPClient called")
	return &HTTPClient{}
}

type RedisService struct {}
func NewRedisService(client *HTTPClient) *RedisService {
	fmt.Println("---------------- NewRedisService called")
	return &RedisService{}
}

type OpenAIService struct {}
func NewOpenAIService(client *HTTPClient) *OpenAIService {
	fmt.Println("---------------- NewOpenAIService called")
	return &OpenAIService{}
}
