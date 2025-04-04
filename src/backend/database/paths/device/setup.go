package database_device

import (
	"context"

	_ "github.com/go-kivik/couchdb"
	"github.com/go-kivik/kivik"
	"github.com/rs/zerolog/log"
)

const DEVICE_DB = "devices"

var DatabaseDevice *kivik.DB

func createIndex(ctx context.Context) {
	indexToken := map[string]interface{}{
		"fields": []string{"token"},
	}

	indexId := map[string]interface{}{
		"fields": []string{"_id"},
	}

	err := DatabaseDevice.CreateIndex(ctx, "token-index", "json", indexToken)
	if err != nil {
		log.Error().Msg(err.Error())
	} else {
		log.Info().
			Str("index", "token-index").
			Str("db", DatabaseDevice.Name()).
			Msg("Index created")
	}

	err = DatabaseDevice.CreateIndex(ctx, "id-index", "json", indexId)
	if err != nil {
		log.Error().Msg(err.Error())
	} else {
		log.Info().
			Str("index", "id-index").
			Str("db", DatabaseDevice.Name()).
			Msg("Index created")
	}
}

func SetupDevice(ctx context.Context, databases map[string]*kivik.DB) {
	DatabaseDevice = databases[DEVICE_DB]
	createIndex(ctx)
}
