import json
import pathlib
import sys

import pytest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "src"))
from lombokratelimit import Decision, Gcra, GcraConfig, KeyedLimiter  # noqa: E402

V = json.loads((pathlib.Path(__file__).resolve().parents[2] / "vectors" / "lombokratelimit-vectors-v1.json").read_text("utf-8"))


def dec(s):
    return Decision(s["allowed"], s["remaining"], s["retryAfterMs"], s["resetAfterMs"])


def cfg(c):
    return GcraConfig(c["limit"], c["periodMs"], c["burst"])


def test_count():
    assert V["caseCount"] >= 100


def test_gcra():
    for s in V["gcra"]:
        g = Gcra(cfg(s["cfg"]))
        for st in s["steps"]:
            assert g.check(st["t"], st["cost"]) == dec(st), st


def test_keyed():
    for s in V["keyed"]:
        k = KeyedLimiter(cfg(s["cfg"]), s["maxKeys"], s["overflow"])
        for st in s["steps"]:
            if "sweep" in st:
                assert k.sweep(st["sweep"]) == st["removed"]
            else:
                assert k.check(st["key"], st["t"], st["cost"]) == dec(st), st
            assert k.size == st["size"]


def test_invalid():
    for bad in (GcraConfig(0, 1, 1), GcraConfig(1, 1, 0)):
        with pytest.raises(ValueError):
            Gcra(bad)
    with pytest.raises(ValueError):
        Gcra(GcraConfig(1, 1, 1)).check(-1)
    with pytest.raises(ValueError):
        Gcra(GcraConfig(1_000_000, 1, 1)).check(2**40)


def test_range_boundary():
    with pytest.raises(ValueError):
        Gcra(GcraConfig(2, 1, 1)).check(2**52)
    assert Gcra(GcraConfig(2, 1, 1)).check(2**52 - 1).allowed
