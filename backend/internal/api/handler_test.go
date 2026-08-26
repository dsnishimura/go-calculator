package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func doRequest(t *testing.T, method, body string) *httptest.ResponseRecorder {
	t.Helper()
	router := NewRouter()
	req := httptest.NewRequest(method, "/api/calculate", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	return rec
}

func TestCalculateHandler_HappyPaths(t *testing.T) {
	cases := []struct {
		name string
		body string
		want float64
	}{
		{"add", `{"operation":"add","operands":[4,5]}`, 9},
		{"subtract", `{"operation":"subtract","operands":[10,4]}`, 6},
		{"multiply", `{"operation":"multiply","operands":[3,4]}`, 12},
		{"divide", `{"operation":"divide","operands":[10,2]}`, 5},
		{"power", `{"operation":"power","operands":[2,3]}`, 8},
		{"sqrt", `{"operation":"sqrt","operands":[9]}`, 3},
		{"percentage", `{"operation":"percentage","operands":[20,50]}`, 10},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			rec := doRequest(t, http.MethodPost, c.body)
			if rec.Code != http.StatusOK {
				t.Fatalf("status = %d, body = %s", rec.Code, rec.Body.String())
			}
			var resp CalculateResponse
			if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
				t.Fatalf("decode response: %v", err)
			}
			if resp.Result != c.want {
				t.Fatalf("result = %v, want %v", resp.Result, c.want)
			}
		})
	}
}

func TestCalculateHandler_ClientErrors(t *testing.T) {
	cases := []struct {
		name       string
		body       string
		wantStatus int
		wantCode   string
	}{
		{"malformed json", `{"operation":"add",`, http.StatusBadRequest, "INVALID_JSON"},
		{"unknown operation", `{"operation":"modulo","operands":[1,2]}`, http.StatusBadRequest, "UNKNOWN_OPERATION"},
		{"wrong operand count", `{"operation":"add","operands":[1]}`, http.StatusBadRequest, "INVALID_OPERAND_COUNT"},
		{"too many operands for sqrt", `{"operation":"sqrt","operands":[1,2]}`, http.StatusBadRequest, "INVALID_OPERAND_COUNT"},
		{"non numeric operand", `{"operation":"add","operands":["a",2]}`, http.StatusBadRequest, "INVALID_JSON"},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			rec := doRequest(t, http.MethodPost, c.body)
			if rec.Code != c.wantStatus {
				t.Fatalf("status = %d, want %d, body = %s", rec.Code, c.wantStatus, rec.Body.String())
			}
			var resp ErrorResponse
			if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
				t.Fatalf("decode response: %v", err)
			}
			if resp.Error.Code != c.wantCode {
				t.Fatalf("code = %q, want %q", resp.Error.Code, c.wantCode)
			}
		})
	}
}

func TestCalculateHandler_MathErrors(t *testing.T) {
	cases := []struct {
		name     string
		body     string
		wantCode string
	}{
		{"divide by zero", `{"operation":"divide","operands":[1,0]}`, "DIVISION_BY_ZERO"},
		{"negative sqrt", `{"operation":"sqrt","operands":[-1]}`, "NEGATIVE_SQRT"},
		{"invalid exponent", `{"operation":"power","operands":[0,-1]}`, "INVALID_EXPONENT"},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			rec := doRequest(t, http.MethodPost, c.body)
			if rec.Code != http.StatusUnprocessableEntity {
				t.Fatalf("status = %d, want 422, body = %s", rec.Code, rec.Body.String())
			}
			var resp ErrorResponse
			if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
				t.Fatalf("decode response: %v", err)
			}
			if resp.Error.Code != c.wantCode {
				t.Fatalf("code = %q, want %q", resp.Error.Code, c.wantCode)
			}
		})
	}
}

func TestCalculateHandler_WrongMethod(t *testing.T) {
	rec := doRequest(t, http.MethodGet, "")
	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("status = %d, want 405", rec.Code)
	}
}

func TestHealthHandler(t *testing.T) {
	router := NewRouter()
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
}
