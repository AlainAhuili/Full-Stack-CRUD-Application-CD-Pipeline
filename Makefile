.PHONY: commit-stage lint test-unit package

# Get the current Git commit SHA to tag our immutable artifacts
GIT_SHA ?= $(shell git rev-parse --short HEAD 2>/dev/null || echo "local")

commit-stage: lint test-unit package
	@echo "Commit Stage Passed! Artifacts created with tag: $(GIT_SHA)"

lint:
	cd frontend && npm run lint
	cd backend && npm run lint

test-unit:
	cd frontend && npm run test:unit
	cd backend && npm run test:unit

package:
	@echo "Building immutable Docker images..."
	docker build -t crud-frontend:$(GIT_SHA) ./frontend
	docker build -t crud-backend:$(GIT_SHA) ./backend
	docker build -t crud-database:$(GIT_SHA) ./database

# Phase 2 Gate: Automated Acceptance Stage
acceptance-stage:
	@echo "Spinning up isolated acceptance testing environment..."
	docker compose up -d --wait
	@echo "Running end-to-end CRUD acceptance tests..."
	@# This is a placeholder for your actual E2E suite (Playwright/Cypress/Newman)
	@curl -s http://localhost:3000 || (echo "Backend unreachable!" && make clean && exit 1)
	@echo "Acceptance Stage Passed! All systems nominal."
	@make clean

clean:
	@echo "Tearing down environments and cleaning up resources..."
	docker compose down -v
