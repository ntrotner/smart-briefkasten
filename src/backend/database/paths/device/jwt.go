package database_device

import (
	"net/http"
	"template_backend/common"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/rs/zerolog/log"
)

type JWTContent struct {
	ID string `json:"_id"`
	jwt.RegisteredClaims
}

func CreateJWT(device *DeviceProfile) (string, time.Time, error) {
	expirationTime := time.Now().Add(time.Minute * 120)
	content := &JWTContent{
		ID: device.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, content)
	signedJWT, err := token.SignedString(common.EnvironmentConfig.JWTKey)

	return signedJWT, expirationTime, err
}

func VerifyJWT(jwtString *string) (*jwt.Token, *JWTContent, error) {
	content := &JWTContent{}

	token, err := jwt.ParseWithClaims(*jwtString, content, func(token *jwt.Token) (any, error) {
		return common.EnvironmentConfig.JWTKey, nil
	})

	if err != nil {
		if err == jwt.ErrSignatureInvalid {
			log.Error().Int("status", http.StatusUnauthorized).Msg("verify JWT")
		}
		log.Error().Int("status", http.StatusBadRequest).Msg("verify JWT")

		return nil, nil, err
	}
	if !token.Valid {
		log.Error().Int("status", http.StatusUnauthorized).Msg("tampered JWT")

		return nil, nil, err
	}

	return token, content, err
}
