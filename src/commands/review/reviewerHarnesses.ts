import type { HarnessKind } from "../../shared/harnesses";

export const reviewerHarnesses = [
	"claude",
	"codex",
] as const satisfies readonly HarnessKind[];

export type ReviewerHarness = (typeof reviewerHarnesses)[number];

export const reviewerNameWords: Record<ReviewerHarness, readonly string[]> = {
	claude: ["claude", "opus"],
	codex: ["codex"],
};
