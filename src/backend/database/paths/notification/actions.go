package database_notification

import (
	"context"
	"errors"
	"time"

	"github.com/go-kivik/kivik"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
)

func SaveNotification(ctx context.Context, deviceId string, topic string, payload string) (*Notification, error) {
	notification := Notification{
		ID:        uuid.New().String(),
		DeviceID:  deviceId,
		Topic:     topic,
		Payload:   payload,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Insert the document into the database
	rev, err := DatabaseNotification.Put(ctx, notification.ID, notification)
	if err != nil {
		log.Error().
			Msg(err.Error())

		return nil, err
	}

	log.Info().
		Str("rev", rev).
		Msg("Created Notification")

	dbNotification := FindNotificationById(ctx, &notification.ID)
	if dbNotification == nil {
		log.Error().
			Msg("Couldn't find newly created notification")

		return nil, errors.New("couldn't find newly created notification")
	}

	return dbNotification, nil
}

func UpdateNotification(ctx context.Context, id string, payload string) error {
	notification := FindNotificationById(ctx, &id)
	if notification == nil {
		return errors.New("couldn't find notification")
	}

	notification.Payload = payload
	notification.UpdatedAt = time.Now()

	_, err := DatabaseNotification.Put(ctx, notification.ID, notification, kivik.Options{"_rev": notification.Rev})
	if err != nil {
		log.Error().
			Msg(err.Error())
		return errors.New("couldn't update notification")
	}

	return nil
}

func DeleteNotification(ctx context.Context, id string) error {
	notification := FindNotificationById(ctx, &id)
	if notification == nil {
		return errors.New("couldn't find notification")
	}

	_, err := DatabaseNotification.Delete(ctx, notification.ID, notification.Rev)
	if err != nil {
		log.Error().
			Msg(err.Error())
		return errors.New("couldn't delete notification")
	}

	return nil
}
