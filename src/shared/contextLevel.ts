import type { HarnessKind } from "./harnesses";
import { resolveHarness } from "./harnessLabel";

type ContextLevel = "red" | "yellow" | "dim";

const THRESHOLDS: Record<HarnessKind, { red: number; yellow: number }> = {
	claude: { red: 30, yellow: 20 },
	codex: { red: 75, yellow: 50 },
	pi: { red: 30, yellow: 20 },
};

export function contextLevel(pct: number, harness?: HarnessKind): ContextLevel {
	const { red, yellow } = THRESHOLDS[resolveHarness(harness)];
	if (pct >= red) return "red";
	if (pct >= yellow) return "yellow";
	return "dim";
}
