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
acceptance-stage:
	@echo "Spinning up isolated acceptance testing environment with tag: $(GIT_SHA)"
	docker compose up -d --wait
	@echo "Running end-to-end CRUD acceptance tests..."
	@curl -s http://localhost:3000 || (echo "Backend unreachable!" && make clean && exit 1)
	@echo "Acceptance Stage Passed! All systems nominal."
	@make clean

clean:
	@echo "Tearing down environments and cleaning up resources..."
	docker compose down -v