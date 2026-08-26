// Package staticfiles embeds the built frontend (frontend/dist, copied into
// this package's dist/ directory by the Docker build) into the server
// binary, so the API server can serve the whole application from one port
// with no separate static-file deployment step.
package staticfiles

import (
	"embed"
	"io/fs"
	"net/http"
	"strings"
)

//go:embed all:dist
var distFS embed.FS

// FS returns the embedded frontend build output rooted at "dist".
func FS() fs.FS {
	sub, err := fs.Sub(distFS, "dist")
	if err != nil {
		panic(err)
	}
	return sub
}

// Handler serves the embedded frontend, falling back to index.html for any
// path that isn't a real file so client-side routes and direct refreshes on
// non-root paths still resolve.
func Handler() http.Handler {
	root := FS()
	fileServer := http.FileServer(http.FS(root))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/")
		if path == "" {
			path = "."
		}
		if info, err := fs.Stat(root, path); err != nil || info.IsDir() {
			r2 := r.Clone(r.Context())
			r2.URL.Path = "/"
			fileServer.ServeHTTP(w, r2)
			return
		}
		fileServer.ServeHTTP(w, r)
	})
}
