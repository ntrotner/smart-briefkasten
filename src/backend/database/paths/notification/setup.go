package database_notification

import (
	"context"

	_ "github.com/go-kivik/couchdb"
	"github.com/go-kivik/kivik"
	"github.com/rs/zerolog/log"
)

const NOTIFICATION_DB = "notifications"

var DatabaseNotification *kivik.DB

func createIndex(ctx context.Context) {
	indexDeviceId := map[string]interface{}{
		"fields": []string{"deviceId"},
	}

	indexTopic := map[string]interface{}{
		"fields": []string{"topic"},
	}

	indexCreatedAt := map[string]interface{}{
		"fields": []string{"createdAt"},
	}

	err := DatabaseNotification.CreateIndex(ctx, "device-id-index", "json", indexDeviceId)
	if err != nil {
		log.Error().Msg(err.Error())
	} else {
		log.Info().
			Str("index", "device-id-index").
			Str("db", DatabaseNotification.Name()).
			Msg("Index created")
	}

	err = DatabaseNotification.CreateIndex(ctx, "topic-index", "json", indexTopic)
	if err != nil {
		log.Error().Msg(err.Error())
	} else {
		log.Info().
			Str("index", "topic-index").
			Str("db", DatabaseNotification.Name()).
			Msg("Index created")
	}

	err = DatabaseNotification.CreateIndex(ctx, "created-at-index", "json", indexCreatedAt)
	if err != nil {
		log.Error().Msg(err.Error())
	} else {
		log.Info().
			Str("index", "created-at-index").
			Str("db", DatabaseNotification.Name()).
			Msg("Index created")
	}
}

func SetupNotification(ctx context.Context, databases map[string]*kivik.DB) {
	DatabaseNotification = databases[NOTIFICATION_DB]
	createIndex(ctx)
}
