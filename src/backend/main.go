package main

import (
	"context"
	"template_backend/database"
	"template_backend/mqtt"
	openapi "template_backend/open-api"

	"github.com/rs/zerolog/log"
)

func main() {
	log.Info().Msg("Server started")
	ctx := context.Background()

	done := make(chan struct{})
	go func() {
		openapi.SetupHttp()
	}()
	go func() {
		mqtt.SetupMqtt()
	}()

	database.Connect(ctx)
	<-done
}
