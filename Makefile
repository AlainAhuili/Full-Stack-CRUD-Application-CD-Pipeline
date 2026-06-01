.PHONY: pipeline commit-stage lint test-unit package acceptance-stage clean

# Establish a single, immutable SHA for the entire execution execution run
export GIT_SHA := $(shell git rev-parse --short HEAD 2>/dev/null || echo "local")

# Master Target: Runs the entire local CD pipeline end-to-end
pipeline: commit-stage acceptance-stage
	@echo "Full local pipeline run complete! Ready for remote push."

# Stage 1: Commit Validation Gates
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

# Stage 2: Automated Acceptance Testing Gate
acceptance:
	@echo "🏗️ Spinning up transient Acceptance Testing Environment..."
	sudo docker compose -f docker-compose.acceptance.yml up -d --wait
	@echo "🏃 Executing E2E Acceptance Suite..."
	node tests/acceptance/auth-flow.spec.js || (make clean && exit 1)
	@echo "🧹 Tearing down transient environment..."
	make clean

clean:
	sudo docker compose -f docker-compose.acceptance.yml down -v
