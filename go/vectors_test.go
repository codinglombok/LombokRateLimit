package lombokratelimit

import (
	"encoding/json"
	"os"
	"testing"
)

type dec struct {
	Allowed      bool  `json:"allowed"`
	Remaining    int64 `json:"remaining"`
	RetryAfterMs int64 `json:"retryAfterMs"`
	ResetAfterMs int64 `json:"resetAfterMs"`
}
type gStep struct {
	T    int64 `json:"t"`
	Cost int64 `json:"cost"`
	dec
}
type kStep struct {
	Sweep   *int64  `json:"sweep"`
	Removed int     `json:"removed"`
	Key     *string `json:"key"`
	T       int64   `json:"t"`
	Cost    int64   `json:"cost"`
	Size    int     `json:"size"`
	dec
}
type vectors struct {
	CaseCount int `json:"caseCount"`
	Gcra      []struct {
		Cfg   Config  `json:"cfg"`
		Steps []gStep `json:"steps"`
	} `json:"gcra"`
	Keyed []struct {
		Cfg      Config  `json:"cfg"`
		MaxKeys  int     `json:"maxKeys"`
		Overflow string  `json:"overflow"`
		Steps    []kStep `json:"steps"`
	} `json:"keyed"`
}

func load(t *testing.T) vectors {
	b, err := os.ReadFile("../vectors/lombokratelimit-vectors-v1.json")
	if err != nil {
		t.Fatal(err)
	}
	var v vectors
	if err := json.Unmarshal(b, &v); err != nil {
		t.Fatal(err)
	}
	if v.CaseCount < 100 {
		t.Fatal("fewer than 100 vector cases")
	}
	return v
}

func same(d Decision, w dec) bool {
	return d.Allowed == w.Allowed && d.Remaining == w.Remaining && d.RetryAfterMs == w.RetryAfterMs && d.ResetAfterMs == w.ResetAfterMs
}

func TestGcra(t *testing.T) {
	for _, s := range load(t).Gcra {
		g, err := NewGcra(s.Cfg)
		if err != nil {
			t.Fatal(err)
		}
		for _, st := range s.Steps {
			d, err := g.Check(st.T, st.Cost)
			if err != nil || !same(d, st.dec) {
				t.Errorf("cfg %+v step %+v: got %+v err %v", s.Cfg, st, d, err)
			}
		}
	}
}

func TestKeyed(t *testing.T) {
	for _, s := range load(t).Keyed {
		k, err := NewKeyedLimiter(s.Cfg, s.MaxKeys, s.Overflow)
		if err != nil {
			t.Fatal(err)
		}
		for _, st := range s.Steps {
			if st.Sweep != nil {
				if got := k.Sweep(*st.Sweep); got != st.Removed {
					t.Errorf("sweep %d: removed %d want %d", *st.Sweep, got, st.Removed)
				}
			} else {
				d, err := k.Check(*st.Key, st.T, st.Cost)
				if err != nil || !same(d, st.dec) {
					t.Errorf("key %q t=%d: got %+v err %v want %+v", *st.Key, st.T, d, err, st.dec)
				}
			}
			if k.Size() != st.Size {
				t.Errorf("size %d want %d", k.Size(), st.Size)
			}
		}
	}
}

func TestInvalid(t *testing.T) {
	for _, c := range []Config{{0, 1, 1}, {1, 0, 1}, {1, 1, 0}, {1_000_001, 1, 1}} {
		if _, err := NewGcra(c); err == nil {
			t.Errorf("config %+v should fail", c)
		}
	}
	g, _ := NewGcra(Config{2, 1, 1})
	if _, err := g.Check(-1, 1); err == nil {
		t.Error("negative time should fail")
	}
	if _, err := g.Check(1<<52, 1); err == nil {
		t.Error("now*limit >= 2^53 should fail")
	}
	if d, err := g.Check(1<<52-1, 1); err != nil || !d.Allowed {
		t.Error("now*limit just below 2^53 should be allowed")
	}
}
