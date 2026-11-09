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

	it("drops the retired sessions.topBar key so old configs still parse", () => {
		const stripped = stripLegacyConfigKeys({
			sessions: { nodeName: "pc-wsl", topBar: false },
		});

		expect(stripped).toEqual({ sessions: { nodeName: "pc-wsl" } });
		expect(assistConfigSchema.safeParse(stripped).success).toBe(true);
	});

	it("drops the retired sessions float-waiting and parking keys so old configs still parse", () => {
		const stripped = stripLegacyConfigKeys({
			sessions: {
				nodeName: "pc-wsl",
				floatWaiting: false,
				floatWaitingAfterMs: 15_000,
				parkWaitingAfterMs: 600_000,
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

	it("drops the retired worktree.includeDrafts key so old configs still parse", () => {
		const stripped = stripLegacyConfigKeys({
			worktree: { enabled: true, includeDrafts: true },
		});

		expect(stripped).toEqual({ worktree: { enabled: true } });
		expect(assistConfigSchema.safeParse(stripped).success).toBe(true);
	});

	it("drops the retired backlog.previewComments key so old configs still parse", () => {
		const stripped = stripLegacyConfigKeys({
			worktree: { enabled: true },
			backlog: { previewComments: true },
		});

		expect(stripped).toEqual({ worktree: { enabled: true } });
		expect(assistConfigSchema.safeParse(stripped).success).toBe(true);
	});

	it("drops the retired roam OAuth block so old configs still parse", () => {
		const stripped = stripLegacyConfigKeys({
			worktree: { enabled: true },
			roam: {
				clientId: "id",
				clientSecret: "secret",
				accessToken: "access",
				refreshToken: "refresh",
				tokenExpiresAt: 1234,
			},
		});

		expect(stripped).toEqual({ worktree: { enabled: true } });
		expect(assistConfigSchema.safeParse(stripped).success).toBe(true);
	});

	it("drops the retired devlog.skip map so old blog configs still parse", () => {
		const stripped = stripLegacyConfigKeys({
			devlog: {
				dir: "~/git/blog/src/content/dev",
				skip: { assist: ["2026-W33"] },
			},
		});

		expect(stripped).toEqual({
			devlog: { dir: "~/git/blog/src/content/dev" },
		});
		expect(assistConfigSchema.safeParse(stripped).success).toBe(true);
	});

	it("drops the retired testflight.account key so old configs still parse", () => {
		const stripped = stripLegacyConfigKeys({
			testflight: { keyId: "N5YK6FM442", account: "my.1password.com" },
		});

		expect(stripped).toEqual({ testflight: { keyId: "N5YK6FM442" } });
		expect(assistConfigSchema.safeParse(stripped).success).toBe(true);
	});

	it("drops the retired review.highLevel.slices flag so old configs still parse", () => {
		const stripped = stripLegacyConfigKeys({
			review: { highLevel: { uiPaths: ["src/ui/**"], slices: true } },
		});

		expect(stripped).toEqual({
			review: { highLevel: { uiPaths: ["src/ui/**"] } },
		});
		expect(assistConfigSchema.safeParse(stripped).success).toBe(true);
	});

	it.each([true, false])(
		"drops the retired advice.sections.editing-files key (%s) so old configs still parse",
		(value) => {
			const config = {
				advice: { sections: { "editing-files": value, markdown: false } },
			};
			expect(assistConfigSchema.safeParse(config).success).toBe(false);

			const stripped = stripLegacyConfigKeys(config);

			expect(stripped).toEqual({ advice: { sections: { markdown: false } } });
			expect(assistConfigSchema.safeParse(stripped).success).toBe(true);
		},
	);

	it("drops retired keys inside repos entries so old global configs still parse", () => {
		const stripped = stripLegacyConfigKeys({
			repos: {
				assist: {
					worktree: { enabled: true, includeDrafts: true, watcher: true },
					sessions: { windowsDaemonPort: 51764 },
					news: { feeds: [] },
				},
			},
		});

		expect(stripped).toEqual({
			repos: {
				assist: { worktree: { enabled: true }, sessions: {}, news: {} },
			},
		});
		expect(assistConfigSchema.safeParse(stripped).success).toBe(true);
	});
});
