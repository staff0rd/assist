import type { HarnessKind } from "../harnesses";

type UsageAccount = { windowPrefix?: string };

export const harnessUsageAccounts: Record<HarnessKind, UsageAccount> = {
	claude: {},
	"claude-sdk": {},
	codex: { windowPrefix: "codex" },
	"codex-sdk": { windowPrefix: "codex" },
	pi: { windowPrefix: "pi" },
};
