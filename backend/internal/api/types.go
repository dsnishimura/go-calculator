package api

// CalculateRequest is the JSON body accepted by POST /api/calculate.
type CalculateRequest struct {
	Operation string    `json:"operation"`
	Operands  []float64 `json:"operands"`
}

// CalculateResponse is the JSON body returned on a successful calculation.
type CalculateResponse struct {
	Operation string    `json:"operation"`
	Operands  []float64 `json:"operands"`
	Result    float64   `json:"result"`
}

// ErrorResponse is the JSON body returned on any error, wrapping a
// machine-readable code alongside a human-readable message.
type ErrorResponse struct {
	Error ErrorBody `json:"error"`
}

type ErrorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}
