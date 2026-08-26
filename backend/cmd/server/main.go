// Command server runs the calculator API and serves the built frontend on
// a single HTTP port.
package main

import (
	"log"
	"net/http"
	"os"

	"github.com/dsnishimura/go-calculator/backend/internal/api"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	router := api.NewRouter()
	addr := ":" + port
	log.Printf("listening on %s", addr)
	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatal(err)
	}
}
