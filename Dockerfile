# Stage 1: build the frontend static assets.
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: build the Go server, embedding the frontend build output.
FROM golang:1.22-alpine AS backend-build
WORKDIR /app/backend
COPY backend/go.mod ./
RUN go mod download
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ./internal/staticfiles/dist
RUN CGO_ENABLED=0 go build -o /server ./cmd/server

# Stage 3: minimal runtime image containing only the built binary.
FROM gcr.io/distroless/static-debian12
COPY --from=backend-build /server /server
EXPOSE 8080
ENTRYPOINT ["/server"]
