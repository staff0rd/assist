import { execFileSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const mockExecFileSync = vi.mocked(execFileSync);

vi.mock("../../shared/readPackageJson", () => ({
	readPackageJson: () => ({ version: "0.488.2" }),
}));

import { buildWatchReport } from "./buildWatchReport";

const logLine = (sha: string, when: string, subject: string): string =>
	[sha.padEnd(40, "0"), sha, when, subject].join("\t");

function respond(responses: Record<string, string>): void {
	mockExecFileSync.mockImplementation((_cmd, args) => {
		const key = (args ?? []).join(" ");
		const response = responses[key];
		if (response === undefined) throw new Error(`unexpected git ${key}`);
		return `${response}\n`;
	});
}

const pretty = "--pretty=format:%H%x09%h%x09%ar%x09%s";
const logArgs = `log -10 ${pretty}`;
const rangeArgs = `log ccc3333..HEAD ${pretty}`;

beforeEach(() => {
	vi.clearAllMocks();
});

describe("buildWatchReport", () => {
	it("lists only the commits pulled since --from, newest first", () => {
		respond({
			"rev-parse --show-toplevel": "/repo",
			[rangeArgs]: [
				logLine("aaa1111", "2 minutes ago", "feat: newest"),
				logLine("bbb2222", "1 hour ago", "fix: middle"),
			].join("\n"),
			"diff --name-only ccc3333..HEAD": "README.md",
		});

		const report = buildWatchReport("ccc3333");

		expect(report).toContain("**Version** 0.488.2");
		expect(report).toContain(
			[
				"| `aaa1111` | 2 minutes ago | feat: newest |",
				"| `bbb2222` | 1 hour ago | fix: middle |",
			].join("\n"),
		);
		expect(report).not.toContain("ccc3333");
		expect(report).not.toContain("← new");
		expect(report).toContain("- none needed");
		expect(report).toContain("- not needed");
	});

	it("lists every pulled commit when the pull brings in more than 10", () => {
		const shas = Array.from({ length: 15 }, (_, index) => `sha${index}`);
		respond({
			"rev-parse --show-toplevel": "/repo",
			[rangeArgs]: shas
				.map((sha) => logLine(sha, "just now", `feat: ${sha}`))
				.join("\n"),
			"diff --name-only ccc3333..HEAD": "README.md",
		});

		const report = buildWatchReport("ccc3333");

		for (const sha of shas) {
			expect(report).toContain(`| \`${sha}\` | just now | feat: ${sha} |`);
		}
	});

	it("says no new commits when --from is already HEAD", () => {
		respond({
			"rev-parse --show-toplevel": "/repo",
			[rangeArgs]: "",
			"diff --name-only ccc3333..HEAD": "",
		});

		expect(buildWatchReport("ccc3333")).toContain("_no new commits_");
	});

	it("derives the restart advice from the files changed since --from", () => {
		respond({
			"rev-parse --show-toplevel": "/repo",
			[rangeArgs]: logLine("aaa1111", "just now", "feat: ui and daemon"),
			"diff --name-only ccc3333..HEAD": [
				"src/commands/sessions/web/ui/App.tsx",
				"src/commands/sessions/daemon/lifecycleHandlers.ts",
			].join("\n"),
		});

		const report = buildWatchReport("ccc3333");

		expect(report).toContain(
			"- restart the web server, then hard-reload the browser tab",
		);
		expect(report).toContain("- restart the daemon");
	});

	it("derives the sync advice from the files changed since --from", () => {
		respond({
			"rev-parse --show-toplevel": "/repo",
			[rangeArgs]: logLine(
				"aaa1111",
				"just now",
				"feat: commands and settings",
			),
			"diff --name-only ccc3333..HEAD": [
				"agent/commands/watch.md",
				"claude/settings.json",
			].join("\n"),
		});

		const report = buildWatchReport("ccc3333");

		expect(report).toContain("- agent/commands changed");
		expect(report).toContain("- claude/settings.json changed");
	});

	it("lists the last 10 commits and asks git for no range when --from is omitted", () => {
		respond({
			"rev-parse --show-toplevel": "/repo",
			[logArgs]: logLine("aaa1111", "2 minutes ago", "feat: newest"),
		});

		const report = buildWatchReport();

		expect(report).toContain("| `aaa1111` | 2 minutes ago | feat: newest |");
		expect(report).toContain("- none needed");
		expect(report).toContain("- not needed");
		expect(
			mockExecFileSync.mock.calls.map((call) => (call[1] as string[])[0]),
		).not.toContain("diff");
	});

	it("falls back to an unknown version when package.json cannot be read", () => {
		respond({ [logArgs]: logLine("aaa1111", "just now", "feat: newest") });

		expect(buildWatchReport()).toContain("**Version** unknown");
	});
});
