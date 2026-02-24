"""Check file-level maintainability index using radon."""

import glob
import sys

from radon.metrics import mi_visit

MIN_MI = 20  # Grade B threshold

failed = []
for path in sorted(glob.glob("src/commands/voice/python/**/*.py", recursive=True)):
    with open(path) as f:
        mi = mi_visit(f.read(), True)
    if mi < MIN_MI:
        failed.append((path, mi))

if failed:
    print("Files with low maintainability index:")
    for path, mi in failed:
        print(f"  {path} - MI: {mi:.1f}")
    sys.exit(1)
