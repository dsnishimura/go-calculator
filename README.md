# go-calculator

A full-stack calculator: a Go REST API (standard library only) and a React + TypeScript
frontend styled after the iOS Calculator app, served together as a single container.

## Architecture

```
.
├── Dockerfile              # single multi-stage build for the whole app
├── backend/                # Go module — API + static file server
│   ├── cmd/server/         # main.go — entrypoint
│   └── internal/
│       ├── calculator/     # pure arithmetic functions (no HTTP knowledge)
│       ├── api/            # request/response types, validation, handlers, router
│       └── staticfiles/    # go:embed of the built frontend
└── frontend/                # Vite + React + TypeScript app
    └── src/
        ├── api/            # fetch wrapper for the backend
        ├── components/     # Calculator, CalculatorPad, Display, ErrorMessage
        └── types/          # shared calculator types
```

At runtime there is a single Go binary. It exposes `POST /api/calculate` and `GET /health`,
and serves the built React app (embedded into the binary via `go:embed`) for every other
path — so in production the frontend and API are same-origin and there's no CORS to
configure.

## Quick start (Docker)

```sh
docker build -t go-calculator .
docker run -p 8080:8080 go-calculator
```

Open http://localhost:8080.

## Local development

Run the backend and frontend as two separate dev servers; Vite proxies `/api` and
`/health` to the Go server so the app works exactly as it will in production.

```sh
# terminal 1 — backend, listens on :8080
cd backend
go run ./cmd/server

# terminal 2 — frontend dev server with hot reload, listens on :5173
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. (A production-style build — `npm run build` then
`go run ./cmd/server` — also works, serving everything from :8080; see Testing below.)

## API reference

### `POST /api/calculate`

Request body:

```json
{ "operation": "add", "operands": [4, 5] }
```

| Operation    | Operands | Meaning                                   |
|--------------|----------|--------------------------------------------|
| `add`        | 2        | `a + b`                                    |
| `subtract`   | 2        | `a - b`                                    |
| `multiply`   | 2        | `a * b`                                    |
| `divide`     | 2        | `a / b`                                    |
| `power`      | 2        | `a ^ b`                                    |
| `sqrt`       | 1        | `√a`                                       |
| `percentage` | 2        | `a` percent of `b`, i.e. `(a / 100) * b`   |

Success response — `200 OK`:

```json
{ "operation": "add", "operands": [4, 5], "result": 9 }
```

Error response — status varies (see below):

```json
{ "error": { "code": "DIVISION_BY_ZERO", "message": "cannot divide by zero" } }
```

#### Status codes

- **400** — the request is structurally invalid: malformed JSON, an unknown operation, or
  the wrong number of operands for the operation (`UNKNOWN_OPERATION`, `INVALID_OPERAND_COUNT`,
  `INVALID_JSON`).
- **422** — the request is well-formed but the calculation itself is invalid: divide by
  zero, square root of a negative number, `0` raised to a negative exponent, or a result
  that overflows to infinity (`DIVISION_BY_ZERO`, `NEGATIVE_SQRT`, `INVALID_EXPONENT`,
  `RESULT_OVERFLOW`).
- **405** — any method other than `POST`.

This 400-vs-422 split is deliberate: 400 means "I don't understand this request", 422
means "I understood it, but the math doesn't work" — which lets the frontend distinguish
a client bug from a genuine mathematical error.

#### Examples

```sh
$ curl -s -X POST localhost:8080/api/calculate -d '{"operation":"add","operands":[4,5]}'
{"operation":"add","operands":[4,5],"result":9}

$ curl -s -X POST localhost:8080/api/calculate -d '{"operation":"divide","operands":[10,4]}'
{"operation":"divide","operands":[10,4],"result":2.5}

$ curl -s -X POST localhost:8080/api/calculate -d '{"operation":"power","operands":[2,10]}'
{"operation":"power","operands":[2,10],"result":1024}

$ curl -s -X POST localhost:8080/api/calculate -d '{"operation":"sqrt","operands":[81]}'
{"operation":"sqrt","operands":[81],"result":9}

$ curl -s -X POST localhost:8080/api/calculate -d '{"operation":"percentage","operands":[20,50]}'
{"operation":"percentage","operands":[20,50],"result":10}

$ curl -s -X POST localhost:8080/api/calculate -d '{"operation":"divide","operands":[1,0]}'
# HTTP 422
{"error":{"code":"DIVISION_BY_ZERO","message":"cannot divide by zero"}}

$ curl -s -X POST localhost:8080/api/calculate -d '{"operation":"sqrt","operands":[-4]}'
# HTTP 422
{"error":{"code":"NEGATIVE_SQRT","message":"cannot take square root of a negative number"}}

$ curl -s -X POST localhost:8080/api/calculate -d '{"operation":"modulo","operands":[1,2]}'
# HTTP 400
{"error":{"code":"UNKNOWN_OPERATION","message":"unknown operation"}}

$ curl -s -X POST localhost:8080/api/calculate -d '{"operation":"add","operands":[1]}'
# HTTP 400
{"error":{"code":"INVALID_OPERAND_COUNT","message":"operation \"add\" requires 2 operand(s), got 1"}}
```

### `GET /health`

```sh
$ curl -s localhost:8080/health
{"status":"ok"}
```

## Usability: how the keypad works

The frontend uses a sequential, keypad-driven entry model — the same one a physical or
iOS calculator uses — rather than two free-text operand fields:

- There's a running **memory** value, starting at **0**, and a **display** showing the
  number currently being typed.
- Type a number on the keypad, then press an operator (`+`, `−`, `×`, `÷`, `xʸ`, `%`).
  That press **confirms** the typed number: it becomes (or combines into) memory, and the
  app now waits for the second number.
- Type the second number and press `=` to send `{memory, typed}` to the backend and show
  the result — which also becomes the new memory, so you can keep chaining
  (`4 + 5 = 9`, then `× 2 =` computes `18`).
- Pressing another operator instead of `=` also confirms the in-flight number and chains
  immediately, exactly like a physical calculator.
- `√` is unary: it acts on whatever's currently on screen immediately, without waiting for
  a second number or an `=` press.
- `AC` resets memory to 0 and clears the display.

A small **expression line** above the main display shows the confirmed number and operator
(e.g. `4 +`) while the second number is being typed, so the pending calculation stays
legible instead of being implied only by a highlighted key.

The keypad also responds to a **physical keyboard**: digits, `.`, `+ - * / % ^`, `Enter`/`=`
for equals, and `Escape` for `AC`.

### Layout

The keypad follows Apple's own scientific-calculator arrangement rather than the plain
4-operator grid, since this calculator has seven operations, not four: `AC` and the three
modifier keys (`xʸ`, `√`, `%`) sit in a muted top row, digits fill the main grid with the
four chainable arithmetic operators in a column of vivid orange to their right, and `=` is
a full-width closing action at the bottom — the one deliberate departure from a literal
iPhone key shape, sized and colored to read as "this is the button that talks to the
server," distinct from the momentary operator presses.

## Design rationale

- **One endpoint, not one per operation.** `POST /api/calculate` with an `operation`
  field centralizes validation, dispatch, and testing instead of duplicating that logic
  across seven near-identical handlers, and it matches the frontend's single "compute"
  action. Documented as a deliberate choice, not an oversight.
- **Standard library only (`net/http` + Go 1.22's routing-pattern `ServeMux`).** The API
  surface is small enough that a router library or framework would add a dependency
  without adding real value.
- **`go:embed` for the frontend, not copying files at runtime.** Embedding
  `frontend/dist` into the binary at build time produces one self-contained binary, lets
  the final Docker stage be `distroless/static` (no shell, no filesystem to manage), and
  removes any risk of the assets directory being missing relative to the working
  directory. The trade-off: the frontend must be built *before* the Go build (see
  Dockerfile), and a frontend-only change still requires rebuilding the Go binary —
  acceptable for this deployment target.
- **400 vs 422**, see API reference above.
- **No client-side numeric validation needed.** Because input only ever comes from the
  keypad (see Usability above), the display can never hold a non-numeric or malformed
  value — invalid *math* (divide by zero, negative sqrt) is still sent to the backend so
  its structured error handling is exercised end-to-end.
- **No UI framework.** The frontend is plain CSS (flexbox + one mobile breakpoint), which
  is proportionate to "basic mobile support" in the spec and keeps the iOS-Calculator-style
  visuals simple to reason about: dark digit keys, a muted tone for the `xʸ`/`√`/`%`
  modifier keys, and vivid orange reserved for the four chainable arithmetic operators —
  a two-tier hierarchy so the seven operations stay scannable instead of reading as one
  undifferentiated row. Light/dark theme follows `prefers-color-scheme`, same as the
  native app.

## Testing & coverage

```sh
# backend
cd backend
go test ./... -coverprofile=coverage/coverage.out
go tool cover -func=coverage/coverage.out   # summary in the terminal
go tool cover -html=coverage/coverage.out -o coverage/coverage.html   # open in a browser

# frontend
cd frontend
npm run test -- --coverage   # Vitest + v8 coverage; report at coverage/index.html
```

Current coverage: `internal/calculator` 100%, `internal/api` ~80% (table-driven tests for
every operation, error path, and the 400/422/405 status mapping); frontend ~95% overall,
100% of statements in every component, including mocked-`fetch` success/error/network-failure
cases for the API client and a full interaction test suite for `Calculator` and
`CalculatorPad` (confirm-on-operator, chaining, the unary `√` modifier, the expression line,
keyboard entry, and AC).
