.PHONY: commit-stage lint test-unit

# The default target that orchestrates the local commit stage
commit-stage: lint test-unit
	@echo "Commit Stage Passed Locally! Safe to push."

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