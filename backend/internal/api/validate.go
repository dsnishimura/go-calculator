package api

import (
	"errors"
	"fmt"
)

// ErrUnknownOperation and ErrWrongOperandCount are structural validation
// failures (the request is well-formed JSON but not a valid calculation
// request); the handler maps these to HTTP 400, distinct from the 422s
// returned for mathematically invalid requests (e.g. divide by zero).
var ErrUnknownOperation = errors.New("unknown operation")

type ErrWrongOperandCount struct {
	Operation string
	Want      int
	Got       int
}

func (e *ErrWrongOperandCount) Error() string {
	return fmt.Sprintf("operation %q requires %d operand(s), got %d", e.Operation, e.Want, e.Got)
}

// operandArity maps each supported operation to the number of operands it expects.
var operandArity = map[string]int{
	"add":        2,
	"subtract":   2,
	"multiply":   2,
	"divide":     2,
	"power":      2,
	"percentage": 2,
	"sqrt":       1,
}

// validateRequest checks that the operation is known and the operand count
// matches its arity. It does not evaluate the operation itself.
func validateRequest(req CalculateRequest) error {
	want, ok := operandArity[req.Operation]
	if !ok {
		return ErrUnknownOperation
	}
	if len(req.Operands) != want {
		return &ErrWrongOperandCount{Operation: req.Operation, Want: want, Got: len(req.Operands)}
	}
	return nil
}
