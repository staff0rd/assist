import type { HarnessKind } from "./harnesses";

export const harnessModels: Record<HarnessKind, readonly string[]> = {
	claude: ["fable", "opus", "sonnet", "haiku"],
	codex: [],
	pi: [],
};
