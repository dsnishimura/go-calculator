package api

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/dsnishimura/go-calculator/backend/internal/calculator"
)

// compute dispatches a validated request to the matching calculator function.
func compute(req CalculateRequest) (float64, error) {
	ops := req.Operands
	switch req.Operation {
	case "add":
		return calculator.Add(ops[0], ops[1])
	case "subtract":
		return calculator.Subtract(ops[0], ops[1])
	case "multiply":
		return calculator.Multiply(ops[0], ops[1])
	case "divide":
		return calculator.Divide(ops[0], ops[1])
	case "power":
		return calculator.Power(ops[0], ops[1])
	case "percentage":
		return calculator.Percentage(ops[0], ops[1])
	case "sqrt":
		return calculator.Sqrt(ops[0])
	default:
		// Unreachable: validateRequest already rejects unknown operations.
		return 0, ErrUnknownOperation
	}
}

// CalculateHandler handles POST /api/calculate.
func CalculateHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED", "only POST is supported")
		return
	}

	var req CalculateRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_JSON", "request body is not valid JSON: "+err.Error())
		return
	}

	if err := validateRequest(req); err != nil {
		var wrongCount *ErrWrongOperandCount
		switch {
		case errors.Is(err, ErrUnknownOperation):
			writeError(w, http.StatusBadRequest, "UNKNOWN_OPERATION", err.Error())
		case errors.As(err, &wrongCount):
			writeError(w, http.StatusBadRequest, "INVALID_OPERAND_COUNT", err.Error())
		default:
			writeError(w, http.StatusBadRequest, "INVALID_REQUEST", err.Error())
		}
		return
	}

	result, err := compute(req)
	if err != nil {
		code, status := mapCalculatorError(err)
		writeError(w, status, code, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, CalculateResponse{
		Operation: req.Operation,
		Operands:  req.Operands,
		Result:    result,
	})
}

// mapCalculatorError maps a calculator sentinel error to a machine-readable
// code and HTTP status. All calculator errors are mathematically invalid
// requests (the request was well-formed) and map to 422.
func mapCalculatorError(err error) (code string, status int) {
	switch {
	case errors.Is(err, calculator.ErrDivideByZero):
		return "DIVISION_BY_ZERO", http.StatusUnprocessableEntity
	case errors.Is(err, calculator.ErrNegativeSqrt):
		return "NEGATIVE_SQRT", http.StatusUnprocessableEntity
	case errors.Is(err, calculator.ErrInvalidExponent):
		return "INVALID_EXPONENT", http.StatusUnprocessableEntity
	case errors.Is(err, calculator.ErrResultOverflow):
		return "RESULT_OVERFLOW", http.StatusUnprocessableEntity
	default:
		return "INTERNAL_ERROR", http.StatusInternalServerError
	}
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, ErrorResponse{Error: ErrorBody{Code: code, Message: message}})
}

// HealthHandler handles GET /health.
func HealthHandler(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
