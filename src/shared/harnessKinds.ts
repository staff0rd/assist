import type { HarnessKind } from "./harnesses";

export const harnessKinds = [
	"claude",
	"claude-sdk",
	"codex",
	"codex-sdk",
	"pi",
] as const satisfies readonly HarnessKind[];
