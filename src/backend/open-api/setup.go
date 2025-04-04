package openapi

import (
	"net/http"
	"template_backend/common"
	openapi "template_backend/open-api/go"

	"github.com/rs/zerolog/log"
)

func SetupHttp() {
	AuthenticationAPIService := openapi.NewAuthenticationAPIService()
	AuthenticationAPIController := openapi.NewAuthenticationAPIController(AuthenticationAPIService)

	StatusAPIService := openapi.NewStatusAPIService()
	StatusAPIController := openapi.NewStatusAPIController(StatusAPIService)

	DeviceAPIService := openapi.NewDeviceAPIService()
	DeviceAPIController := openapi.NewDeviceAPIController(DeviceAPIService)

	router := openapi.NewRouter(
		AuthenticationAPIController,
		StatusAPIController,
		DeviceAPIController,
	)
	common.SetupPerformanceLogger(router)
	common.SetupSwaggerUi(router)

	log.Info().Msg("Listening on: " + common.EnvironmentConfig.Host)
	log.Fatal().Msg(http.ListenAndServe(common.EnvironmentConfig.Host, router).Error())
}
