import type { HarnessKind } from "../harnesses";

type UsageAccount = { windowPrefix?: string };

export const harnessUsageAccounts: Record<HarnessKind, UsageAccount> = {
	claude: {},
	codex: { windowPrefix: "codex" },
	pi: { windowPrefix: "pi" },
};
