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
