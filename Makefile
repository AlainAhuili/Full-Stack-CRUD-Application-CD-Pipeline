.PHONY: commit-stage lint test-unit package acceptance clean

# Dynamically resolve the short SHA locally or fallback to 'local'
GIT_SHA ?= $(shell git rev-parse --short HEAD 2>/dev/null || echo "local")
export GIT_SHA

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
	sudo docker build -t crud-frontend:$(GIT_SHA) ./frontend
	sudo docker build -t crud-backend:$(GIT_SHA) ./backend
	sudo docker build -t crud-database:$(GIT_SHA) ./database

acceptance:
	@echo "Spinning up transient Acceptance Testing Environment with tag: $(GIT_SHA)"
	# CRITICAL: We pass GIT_SHA directly inside the sudo command context
	sudo GIT_SHA=$(GIT_SHA) docker compose -f docker-compose.acceptance.yml up -d --wait
	@echo "Executing E2E Acceptance Suite..."
	node tests/acceptance/auth-flow.spec.js || (make clean && exit 1)
	@echo "Tearing down transient environment..."
	make clean

clean:
	# CRITICAL: Do the same here so cleanup finds the correct images
	sudo GIT_SHA=$(GIT_SHA) docker compose -f docker-compose.acceptance.yml down -v
