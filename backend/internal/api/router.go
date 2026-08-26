package api

import (
	"net/http"

	"github.com/dsnishimura/go-calculator/backend/internal/staticfiles"
)

// NewRouter registers the API endpoints and, as a catch-all, the embedded
// frontend static files.
func NewRouter() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/calculate", CalculateHandler)
	mux.HandleFunc("/health", HealthHandler)
	mux.Handle("/", staticfiles.Handler())
	return mux
}
