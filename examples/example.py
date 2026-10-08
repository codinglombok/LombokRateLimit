import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "python" / "src"))
from lombokratelimit import GcraConfig, KeyedLimiter

rl = KeyedLimiter(GcraConfig(5, 1000, 5))
for i in range(7):
    d = rl.check("client-a", 0)
    print(i, str(d.allowed).lower(), "remaining", d.remaining, "retryAfterMs", d.retry_after_ms)
print("t=200", str(rl.check("client-a", 200).allowed).lower())
