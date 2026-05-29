FROM postgres:16-alpine

ENV POSTGRES_DB=crud_db
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres

COPY migrations/*.sql /docker-entrypoint-initdb.d/