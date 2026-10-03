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

const logArgs = "log -10 --pretty=format:%H%x09%h%x09%ar%x09%s";

beforeEach(() => {
	vi.clearAllMocks();
});

describe("buildWatchReport", () => {
	it("renders the version, the commit table and the commits new since --from", () => {
		respond({
			"rev-parse --show-toplevel": "/repo",
			[logArgs]: [
				logLine("aaa1111", "2 minutes ago", "feat: newest"),
				logLine("bbb2222", "1 hour ago", "fix: middle"),
				logLine("ccc3333", "3 days ago", "chore: oldest"),
			].join("\n"),
			"rev-list ccc3333..HEAD": [
				"aaa1111".padEnd(40, "0"),
				"bbb2222".padEnd(40, "0"),
			].join("\n"),
			"diff --name-only ccc3333..HEAD": "README.md",
		});

		const report = buildWatchReport("ccc3333");

		expect(report).toContain("**Version** 0.488.2");
		expect(report).toContain(
			"| `aaa1111` | 2 minutes ago | feat: newest ← new |",
		);
		expect(report).toContain("| `bbb2222` | 1 hour ago | fix: middle ← new |");
		expect(report).toContain("| `ccc3333` | 3 days ago | chore: oldest |");
		expect(report).toContain("- none needed");
		expect(report).toContain("- not needed");
	});

	it("derives the restart advice from the files changed since --from", () => {
		respond({
			"rev-parse --show-toplevel": "/repo",
			[logArgs]: logLine("aaa1111", "just now", "feat: ui and daemon"),
			"rev-list ccc3333..HEAD": "aaa1111".padEnd(40, "0"),
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
			[logArgs]: logLine("aaa1111", "just now", "feat: commands and settings"),
			"rev-list ccc3333..HEAD": "aaa1111".padEnd(40, "0"),
			"diff --name-only ccc3333..HEAD": [
				"claude/commands/watch.md",
				"claude/settings.json",
			].join("\n"),
		});

		const report = buildWatchReport("ccc3333");

		expect(report).toContain("- claude/commands changed");
		expect(report).toContain("- claude/settings.json changed");
	});

	it("marks nothing new and asks git for no range when --from is omitted", () => {
		respond({
			"rev-parse --show-toplevel": "/repo",
			[logArgs]: logLine("aaa1111", "2 minutes ago", "feat: newest"),
		});

		const report = buildWatchReport();

		expect(report).not.toContain("← new");
		expect(report).toContain("- none needed");
		expect(report).toContain("- not needed");
		expect(
			mockExecFileSync.mock.calls.map((call) => (call[1] as string[])[0]),
		).not.toContain("rev-list");
	});

	it("falls back to an unknown version when package.json cannot be read", () => {
		respond({ [logArgs]: logLine("aaa1111", "just now", "feat: newest") });

		expect(buildWatchReport()).toContain("**Version** unknown");
	});
});
