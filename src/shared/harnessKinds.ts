import type { HarnessKind } from "./harnesses";

export const harnessKinds = [
	"claude",
	"codex",
	"pi",
] as const satisfies readonly HarnessKind[];
