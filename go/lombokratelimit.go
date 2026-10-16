// Package lombokratelimit implements deterministic rate limiting with the Generic Cell Rate Algorithm.
// Time is passed in explicitly. Part of the Lombok Ecosystem.
package lombokratelimit

import "errors"

// Config configures a limiter. Limit is events per PeriodMs; Burst is the burst capacity in events.
type Config struct {
	Limit    int64 `json:"limit"`
	PeriodMs int64 `json:"periodMs"`
	Burst    int64 `json:"burst"`
}

// Decision is the result of one check.
type Decision struct {
	Allowed      bool
	Remaining    int64
	RetryAfterMs int64
	ResetAfterMs int64
}

// ErrRange reports an argument outside the range defined by the SPEC.
var ErrRange = errors.New("lombokratelimit: argument out of range")

const (
	maxSafe = int64(1) << 53
	max31   = int64(1) << 31
)

func checkConfig(c Config) error {
	if c.Limit < 1 || c.Limit > 1_000_000 || c.PeriodMs < 1 || c.PeriodMs > max31 || c.Burst < 1 || c.Burst > max31 {
		return ErrRange
	}
	return nil
}

func ceilDiv(a, b int64) int64 { return (a + b - 1) / b }

// Gcra is a single limiter. It is not safe for concurrent use.
type Gcra struct {
	cfg Config
	tat int64
}

// NewGcra validates the configuration and returns a limiter.
func NewGcra(cfg Config) (*Gcra, error) {
	if err := checkConfig(cfg); err != nil {
		return nil, err
	}
	return &Gcra{cfg: cfg}, nil
}

// Check decides a request of size cost at time nowMs and consumes capacity when allowed.
func (g *Gcra) Check(nowMs, cost int64) (Decision, error) {
	c := g.cfg
	if nowMs < 0 || nowMs*c.Limit >= maxSafe || nowMs > maxSafe {
		return Decision{}, ErrRange
	}
	if cost < 0 || cost > max31 {
		return Decision{}, ErrRange
	}
	now := nowMs * c.Limit
	capacity := c.Burst * c.PeriodMs
	base := g.tat
	if now > base {
		base = now
	}
	next := base + cost*c.PeriodMs
	allowed := next-now <= capacity
	if allowed {
		g.tat = next
	}
	cur := g.tat - now
	if cur < 0 {
		cur = 0
	}
	wait := int64(0)
	if !allowed {
		if cost > c.Burst {
			wait = -1
		} else {
			wait = ceilDiv(next-now-capacity, c.Limit)
		}
	}
	return Decision{allowed, (capacity - cur) / c.PeriodMs, wait, ceilDiv(cur, c.Limit)}, nil
}

// IsIdle reports whether capacity is full at nowMs (safe to drop from a key table).
func (g *Gcra) IsIdle(nowMs int64) bool { return g.tat <= nowMs*g.cfg.Limit }

// KeyedLimiter keeps one Gcra per key, with a cap on the number of keys.
type KeyedLimiter struct {
	cfg      Config
	maxKeys  int
	overflow string
	m        map[string]*Gcra
}

// NewKeyedLimiter returns a per-key limiter. overflow is "deny" or "allow".
func NewKeyedLimiter(cfg Config, maxKeys int, overflow string) (*KeyedLimiter, error) {
	if err := checkConfig(cfg); err != nil || maxKeys < 1 || (overflow != "deny" && overflow != "allow") {
		return nil, ErrRange
	}
	return &KeyedLimiter{cfg, maxKeys, overflow, map[string]*Gcra{}}, nil
}

// Size returns the number of tracked keys.
func (k *KeyedLimiter) Size() int { return len(k.m) }

// Check decides a request for key.
func (k *KeyedLimiter) Check(key string, nowMs, cost int64) (Decision, error) {
	g := k.m[key]
	if g == nil {
		if len(k.m) >= k.maxKeys {
			k.Sweep(nowMs)
		}
		if len(k.m) >= k.maxKeys {
			return Decision{Allowed: k.overflow == "allow"}, nil
		}
		g = &Gcra{cfg: k.cfg}
		k.m[key] = g
	}
	return g.Check(nowMs, cost)
}

// Sweep drops idle keys and returns how many were removed.
func (k *KeyedLimiter) Sweep(nowMs int64) int {
	n := 0
	for key, g := range k.m {
		if g.IsIdle(nowMs) {
			delete(k.m, key)
			n++
		}
	}
	return n
}
