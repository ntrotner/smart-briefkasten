package database_notification

import (
	"context"

	"github.com/rs/zerolog/log"
)

func createFindNotificationQuery(deviceId *string, topic *string, fields []interface{}) map[string]interface{} {
	query := map[string]interface{}{
		"selector": map[string]interface{}{},
		"limit":    1,
	}

	if fields != nil {
		query["fields"] = fields
	}

	if deviceId != nil {
		query["selector"].(map[string]interface{})["deviceId"] = map[string]interface{}{"$eq": *deviceId}
	}
	if topic != nil {
		query["selector"].(map[string]interface{})["topic"] = map[string]interface{}{"$eq": *topic}
	}

	return query
}

func FindNotificationById(ctx context.Context, id *string) *Notification {
	options := createFindNotificationQuery(nil, nil, nil)
	options["selector"].(map[string]interface{})["_id"] = map[string]interface{}{"$eq": *id}

	rows, err := DatabaseNotification.Find(ctx, options)
	if err != nil {
		log.Error().Msg(err.Error())
	}
	defer rows.Close()

	for rows.Next() {
		var notification Notification
		if err := rows.ScanDoc(&notification); err != nil {
			log.Error().Msg(err.Error())
			return nil
		} else {
			return &notification
		}
	}
	return nil
}

func FindNotificationsByDeviceId(ctx context.Context, deviceId string, limit int) []Notification {
	options := createFindNotificationQuery(&deviceId, nil, nil)
	options["limit"] = limit
	options["sort"] = []map[string]string{{"createdAt": "desc"}}

	rows, err := DatabaseNotification.Find(ctx, options)
	if err != nil {
		log.Error().Msg(err.Error())
		return nil
	}
	defer rows.Close()

	var notifications []Notification
	for rows.Next() {
		var notification Notification
		if err := rows.ScanDoc(&notification); err != nil {
			log.Error().Msg(err.Error())
			continue
		}
		notifications = append(notifications, notification)
	}
	return notifications
}

func FindNotificationsByTopic(ctx context.Context, topic string, limit int) []Notification {
	options := createFindNotificationQuery(nil, &topic, nil)
	options["limit"] = limit
	options["sort"] = []map[string]string{{"createdAt": "desc"}}

	rows, err := DatabaseNotification.Find(ctx, options)
	if err != nil {
		log.Error().Msg(err.Error())
		return nil
	}
	defer rows.Close()

	var notifications []Notification
	for rows.Next() {
		var notification Notification
		if err := rows.ScanDoc(&notification); err != nil {
			log.Error().Msg(err.Error())
			continue
		}
		notifications = append(notifications, notification)
	}
	return notifications
}
