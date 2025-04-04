#!make

# Env setup
DOCKER_COMPOSE := ""
ifneq ($(shell command -v docker-compose),)
	DOCKER_COMPOSE = docker-compose
else ifneq ($(shell command -v docker compose),)
	DOCKER_COMPOSE = docker compose
else
	$(error Neither docker-compose nor docker compose is available)
	exit 1
endif

# Prod setup
include ${PWD}/environment/prod/build.env
export $(shell sed 's/=.*//' ${PWD}/environment/prod/build.env)

SHELL := /bin/bash

setup-env:
	cp ${PWD}/scripts/git/* ${PWD}/.git/hooks/
	go install github.com/gordonklaus/ineffassign@latest
	go install github.com/fzipp/gocyclo/cmd/gocyclo@latest
	go install github.com/bykof/go-plantuml@latest
	cd ./src/ui && npm install

# Start
# run app in local for development
# TARGET = dev/prod
run:
	make clean || true
	docker network create host_network || true
	export docker_env=${TARGET} && ${DOCKER_COMPOSE} up --build --remove-orphans --force-recreate

shutdown:
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE) stop ui db backend nginx

clean:
	make shutdown
	docker container rm nginx ui backend db
	docker network rm host_network

# OpenAPI
openapi-generate-backend:
	docker run --rm --user 1000:1000 \
			-v ${PWD}/src/backend/open-api:/local \
			-v ${PWD}/shared:/shared \
			-v /usr/local/go/bin/gofmt:/usr/local/bin/gofmt \
			-e GO_POST_PROCESS_FILE="/usr/local/bin/gofmt -w" \
			openapitools/openapi-generator-cli generate \
			-i /shared/openApi.yaml \
			-g go-server \
			-o /local/ \
			--additional-properties="outputAsLibrary=true,enablePostProcessFile=true"
	cat ${PWD}/shared/openApi.yaml | yq -o=json -I2 > ${PWD}/src/backend/open-api/swaggerui/swagger.json

openapi-generate-ui:
	docker run --rm --user 1000:1000 \
			-v ${PWD}/src/ui/src/lib/open-api:/local \
			-v ${PWD}/shared:/shared \
			openapitools/openapi-generator-cli generate \
			-i /shared/openApi.yaml \
			-g typescript-fetch \
			-o /local/

openapi-generate:
	make openapi-generate-backend
	make openapi-generate-ui