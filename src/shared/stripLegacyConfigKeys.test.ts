import { describe, expect, it } from "vitest";
import { stripLegacyConfigKeys } from "./stripLegacyConfigKeys";
import { assistConfigSchema } from "./types";

describe("stripLegacyConfigKeys", () => {
	it("drops the retired windows proxy keys so old configs still parse", () => {
		const stripped = stripLegacyConfigKeys({
			sessions: {
				nodeName: "pc-wsl",
				windowsProjectsRoot: "/mnt/c/Users/me/.claude/projects",
				windowsDaemonHost: "127.0.0.1",
				windowsDaemonPort: 51764,
				windowsVersionCheck: "warn",
			},
		});

		expect(stripped).toEqual({ sessions: { nodeName: "pc-wsl" } });
		expect(assistConfigSchema.safeParse(stripped).success).toBe(true);
	});

	it("drops the retired worktree.watcher key so old configs still parse", () => {
		const stripped = stripLegacyConfigKeys({
			worktree: { enabled: true, watcher: true },
		});

		expect(stripped).toEqual({ worktree: { enabled: true } });
		expect(assistConfigSchema.safeParse(stripped).success).toBe(true);
	});
});
