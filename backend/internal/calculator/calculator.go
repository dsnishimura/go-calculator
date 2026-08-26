// Package calculator implements the pure arithmetic operations exposed by the API.
// It has no HTTP knowledge: each function takes numeric operands and returns a
// result or a typed sentinel error, so the API layer can map errors to status
// codes without string matching.
package calculator

import (
	"errors"
	"math"
)

var (
	ErrDivideByZero    = errors.New("cannot divide by zero")
	ErrNegativeSqrt    = errors.New("cannot take square root of a negative number")
	ErrInvalidExponent = errors.New("invalid exponent: zero raised to a negative power is undefined")
	ErrResultOverflow  = errors.New("result is not a finite number")
)

// checkFinite guards against results that overflow to +/-Inf or become NaN
// (e.g. very large exponents) before they are returned to the caller.
func checkFinite(result float64) (float64, error) {
	if math.IsInf(result, 0) || math.IsNaN(result) {
		return 0, ErrResultOverflow
	}
	return result, nil
}

func Add(a, b float64) (float64, error) {
	return checkFinite(a + b)
}

func Subtract(a, b float64) (float64, error) {
	return checkFinite(a - b)
}

func Multiply(a, b float64) (float64, error) {
	return checkFinite(a * b)
}

func Divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, ErrDivideByZero
	}
	return checkFinite(a / b)
}

func Power(a, b float64) (float64, error) {
	if a == 0 && b < 0 {
		return 0, ErrInvalidExponent
	}
	return checkFinite(math.Pow(a, b))
}

func Sqrt(a float64) (float64, error) {
	if a < 0 {
		return 0, ErrNegativeSqrt
	}
	return checkFinite(math.Sqrt(a))
}

// Percentage computes "a percent of b": (a / 100) * b.
// For example, Percentage(20, 50) == 10 (20% of 50).
func Percentage(a, b float64) (float64, error) {
	return checkFinite((a / 100) * b)
}
