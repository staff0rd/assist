import type { HarnessKind } from "../harnesses";

const HARNESS_LABELS: Record<HarnessKind, string> = {
	claude: "Claude",
	"claude-sdk": "Claude (SDK)",
	codex: "Codex",
	"codex-sdk": "Codex (SDK)",
	pi: "pi",
};

const HARNESS_PRODUCT_LABELS: Record<HarnessKind, string> = {
	claude: "Claude Code",
	"claude-sdk": "Claude Code",
	codex: "Codex",
	"codex-sdk": "Codex",
	pi: "pi",
};

const HARNESS_AGENT_NAMES: Record<HarnessKind, string> = {
	claude: "Claude",
	"claude-sdk": "Claude",
	codex: "Codex",
	"codex-sdk": "Codex",
	pi: "pi",
};

export const legacyDefaultHarness: HarnessKind = "claude";

export function resolveHarness(harness: HarnessKind | undefined): HarnessKind {
	return harness ?? legacyDefaultHarness;
}

export function harnessLabel(harness: HarnessKind | undefined): string {
	const kind = resolveHarness(harness);
	return (HARNESS_LABELS[kind] as string | undefined) ?? kind;
}

export function harnessProductLabel(harness: HarnessKind | undefined): string {
	const kind = resolveHarness(harness);
	return (HARNESS_PRODUCT_LABELS[kind] as string | undefined) ?? kind;
}

export function harnessAgentName(harness: HarnessKind | undefined): string {
	const kind = resolveHarness(harness);
	return (HARNESS_AGENT_NAMES[kind] as string | undefined) ?? kind;
}
