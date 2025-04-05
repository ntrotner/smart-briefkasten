package database

import (
	"context"
	"fmt"
	"template_backend/common"
	database_device "template_backend/database/paths/device"
	database_notification "template_backend/database/paths/notification"
	"time"

	_ "github.com/go-kivik/couchdb"
	"github.com/go-kivik/kivik"
	"github.com/rs/zerolog/log"
)

type databaseConnector struct {
	Client *kivik.Client
}

var Connection databaseConnector
var databases = make(map[string]*kivik.DB)

func createConnection(ctx context.Context) *kivik.Client {
	for {
		client, err := kivik.New("couch", common.EnvironmentConfig.DatabaseHost)

		if err != nil {
			log.Fatal().Msg("Database Connection Failed: " + err.Error())
			time.Sleep(5 * time.Second)
			continue
		}

		_, err = client.Session(ctx)
		if err != nil {
			fmt.Printf("Authentication error: %v\n", err)
			fmt.Println("Retrying in 5 seconds...")
			time.Sleep(5 * time.Second)
			continue
		}

		log.Info().Msg("Database Connection Successful")
		return client
	}
}

func createDatabase(ctx context.Context, dbName string) {
	exists, err := Connection.Client.DBExists(ctx, dbName)
	if err != nil {
		log.Error().Msg(err.Error())
	}

	if !exists {
		if err := Connection.Client.CreateDB(ctx, dbName); err != nil {
			log.Error().Msg(err.Error())
		}
	}
	databases[dbName] = Connection.Client.DB(ctx, dbName)
}

func Connect(ctx context.Context) {
	Connection = databaseConnector{
		Client: createConnection(ctx),
	}

	for _, value := range []string{
		database_device.DEVICE_DB,
		database_notification.NOTIFICATION_DB,
	} {
		createDatabase(ctx, value)
	}

	go database_device.SetupDevice(ctx, databases)
	go database_notification.SetupNotification(ctx, databases)
}
