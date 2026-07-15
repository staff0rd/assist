import type { HarnessKind } from "./harnesses";

const HARNESS_LABELS: Record<HarnessKind, string> = {
	claude: "Claude",
	codex: "Codex",
	pi: "pi",
};

export function resolveHarness(harness: HarnessKind | undefined): HarnessKind {
	return harness ?? "claude";
}

export function harnessLabel(harness: HarnessKind | undefined): string {
	return HARNESS_LABELS[resolveHarness(harness)];
}
