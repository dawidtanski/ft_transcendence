.DEFAULT_GOAL := help

PROJECT_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
DOCKER ?= $(shell if docker info >/dev/null 2>&1; then printf '%s' docker; else printf '%s' 'sudo docker'; fi)
COMPOSE = $(DOCKER) compose --project-directory "$(PROJECT_DIR)" -f "$(PROJECT_DIR)compose.yml"
SERVICE ?=

.PHONY: help up down stop restart build rebuild ps logs config nginx-test nginx-reload cert-info db

help:
	@printf '%s\n' \
	  'make up                    Build and start; detect IPs for the certificate' \
	  'make down                  Remove project containers and networks' \
	  'make stop                  Stop containers without removing them' \
	  'make restart               Recreate containers and detect current IPs' \
	  'make build                 Build images without starting containers' \
	  'make rebuild               Remove containers, build without cache, start' \
	  'make ps                    Show container status' \
	  'make logs                  Follow logs (Ctrl+C to exit)' \
	  'make logs SERVICE=nginx    Follow logs of one service' \
	  'make config                Validate Compose without displaying secrets' \
	  'make nginx-test            Check the running Nginx configuration' \
	  'make nginx-reload          Check and reload Nginx configuration' \
	  'make cert-info             Show certificate validity and addresses' \
	  'make db                    Open psql inside PostgreSQL' \
	  '' \
	  'Database data and certificates are preserved by these targets.'

up:
	bash "$(PROJECT_DIR)start.sh"

down:
	$(COMPOSE) down

stop:
	$(COMPOSE) stop

restart:
	$(MAKE) down
	$(MAKE) up

build:
	$(COMPOSE) build

rebuild:
	$(MAKE) down
	$(COMPOSE) build --no-cache
	$(MAKE) up

ps:
	$(COMPOSE) ps -a

logs:
	$(COMPOSE) logs --tail=100 -f $(SERVICE)

config:
	$(COMPOSE) config --quiet

nginx-test:
	$(COMPOSE) exec nginx nginx -t

nginx-reload:
	$(COMPOSE) exec nginx nginx -t
	$(COMPOSE) exec nginx nginx -s reload

cert-info:
	$(COMPOSE) exec nginx openssl x509 -in /etc/nginx/certs/localhost.crt -noout -dates -ext subjectAltName

db:
	$(COMPOSE) exec postgres sh -c 'exec psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"'
