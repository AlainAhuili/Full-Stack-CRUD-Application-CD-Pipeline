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
	@echo "Running transactional end-to-end CRUD acceptance tests..."
	@echo "1. Creating a new user record via POST..."
	@USER_PAYLOAD=$$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"DevOps Engineer","email":"devops@example.com"}' http://localhost:3000/api/users); \
	echo "Response: $$USER_PAYLOAD"; \
	if ! echo "$$USER_PAYLOAD" | grep -q "devops@example.com"; then \
		echo "Failed to create user!"; make clean; exit 1; \
	fi
	@echo "2. Fetching the user records list via GET..."
	@GET_PAYLOAD=$$(curl -s http://localhost:3000/api/users); \
	echo "Response: $$GET_PAYLOAD"; \
	if ! echo "$$GET_PAYLOAD" | grep -q "DevOps Engineer"; then \
		echo "Verification payload check failed!"; make clean; exit 1; \
	fi
	@echo "Acceptance Stage Passed! All transactional assertions verified."
	@make clean

clean:
	@echo "Tearing down environments and cleaning up resources..."
	docker compose down -v