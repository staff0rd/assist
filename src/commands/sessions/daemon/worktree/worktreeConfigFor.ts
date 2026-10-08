import { loadConfigFrom } from "../../../../shared/loadConfigFrom";
import type { AssistConfig } from "../../../../shared/types";

type WorktreeConfig = NonNullable<AssistConfig["worktree"]>;

const DISABLED: WorktreeConfig = {
	enabled: false,
	trunk: false,
	install: true,
	commitBeforeManualChecks: false,
	copy: [".env", "settings.local.json", ".claude/settings.local.json"],
};

export function worktreeConfigFor(cwd: string): WorktreeConfig {
	try {
		return loadConfigFrom(cwd).worktree ?? DISABLED;
	} catch {
		return DISABLED;
	}
}
