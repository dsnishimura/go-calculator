package calculator

import (
	"errors"
	"math"
	"testing"
)

func TestAdd(t *testing.T) {
	cases := []struct {
		name    string
		a, b    float64
		want    float64
		wantErr error
	}{
		{"positive", 2, 3, 5, nil},
		{"negative", -2, -3, -5, nil},
		{"mixed", -2, 5, 3, nil},
		{"zero", 0, 0, 0, nil},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			got, err := Add(c.a, c.b)
			assertResult(t, got, err, c.want, c.wantErr)
		})
	}
}

func TestSubtract(t *testing.T) {
	cases := []struct {
		name    string
		a, b    float64
		want    float64
		wantErr error
	}{
		{"positive", 5, 3, 2, nil},
		{"negative result", 3, 5, -2, nil},
		{"zero", 0, 0, 0, nil},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			got, err := Subtract(c.a, c.b)
			assertResult(t, got, err, c.want, c.wantErr)
		})
	}
}

func TestMultiply(t *testing.T) {
	cases := []struct {
		name    string
		a, b    float64
		want    float64
		wantErr error
	}{
		{"positive", 4, 5, 20, nil},
		{"by zero", 4, 0, 0, nil},
		{"negative", -4, 5, -20, nil},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			got, err := Multiply(c.a, c.b)
			assertResult(t, got, err, c.want, c.wantErr)
		})
	}
}

func TestDivide(t *testing.T) {
	cases := []struct {
		name    string
		a, b    float64
		want    float64
		wantErr error
	}{
		{"positive", 10, 2, 5, nil},
		{"by zero", 10, 0, 0, ErrDivideByZero},
		{"zero by zero", 0, 0, 0, ErrDivideByZero},
		{"negative divisor", 10, -2, -5, nil},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			got, err := Divide(c.a, c.b)
			assertResult(t, got, err, c.want, c.wantErr)
		})
	}
}

func TestPower(t *testing.T) {
	cases := []struct {
		name    string
		a, b    float64
		want    float64
		wantErr error
	}{
		{"positive base and exponent", 2, 3, 8, nil},
		{"zero exponent", 5, 0, 1, nil},
		{"zero to zero", 0, 0, 1, nil},
		{"zero to negative", 0, -1, 0, ErrInvalidExponent},
		{"negative exponent", 2, -2, 0.25, nil},
		{"overflow", 10, 1000, 0, ErrResultOverflow},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			got, err := Power(c.a, c.b)
			assertResult(t, got, err, c.want, c.wantErr)
		})
	}
}

func TestSqrt(t *testing.T) {
	cases := []struct {
		name    string
		a       float64
		want    float64
		wantErr error
	}{
		{"positive", 9, 3, nil},
		{"zero", 0, 0, nil},
		{"negative", -1, 0, ErrNegativeSqrt},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			got, err := Sqrt(c.a)
			assertResult(t, got, err, c.want, c.wantErr)
		})
	}
}

func TestPercentage(t *testing.T) {
	cases := []struct {
		name    string
		a, b    float64
		want    float64
		wantErr error
	}{
		{"20 percent of 50", 20, 50, 10, nil},
		{"100 percent", 100, 42, 42, nil},
		{"zero percent", 0, 42, 0, nil},
		{"negative percentage", -10, 50, -5, nil},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			got, err := Percentage(c.a, c.b)
			assertResult(t, got, err, c.want, c.wantErr)
		})
	}
}

func assertResult(t *testing.T, got float64, err error, want float64, wantErr error) {
	t.Helper()
	if wantErr != nil {
		if !errors.Is(err, wantErr) {
			t.Fatalf("expected error %v, got %v", wantErr, err)
		}
		return
	}
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if math.Abs(got-want) > 1e-9 {
		t.Fatalf("got %v, want %v", got, want)
	}
}
