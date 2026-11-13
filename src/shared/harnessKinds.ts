import type { HarnessKind } from "./harnesses";

export const harnessKinds = [
	"claude",
	"claude-sdk",
	"codex",
	"pi",
] as const satisfies readonly HarnessKind[];
