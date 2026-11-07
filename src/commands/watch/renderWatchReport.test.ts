import { describe, expect, it } from "vitest";
import type { CommitEntry } from "./CommitEntry";
import { renderWatchReport } from "./renderWatchReport";

const commit = (sha: string, when: string, subject: string): CommitEntry => ({
	sha: sha.padEnd(40, "0"),
	short: sha,
	when,
	subject,
});

const commits = [
	commit("aaa1111", "2 minutes ago", "feat: newest"),
	commit("bbb2222", "1 hour ago", "fix: middle"),
	commit("ccc3333", "3 days ago", "chore: oldest"),
];

const render = (
	overrides: Partial<Parameters<typeof renderWatchReport>[0]> = {},
): string =>
	renderWatchReport({
		version: "0.488.2",
		commits,
		pulled: false,
		restarts: [],
		syncs: [],
		...overrides,
	});

describe("renderWatchReport", () => {
	it("leads with the built version", () => {
		expect(render().split("\n")[0]).toBe("**Version** 0.488.2");
	});

	it("renders the commits newest-first as a SHA/When/Subject table", () => {
		expect(render()).toContain(
			[
				"| SHA | When | Subject |",
				"| --- | --- | --- |",
				"| `aaa1111` | 2 minutes ago | feat: newest |",
				"| `bbb2222` | 1 hour ago | fix: middle |",
				"| `ccc3333` | 3 days ago | chore: oldest |",
			].join("\n"),
		);
	});

	it("lists every pulled commit without a new marker", () => {
		const many = Array.from({ length: 12 }, (_, index) =>
			commit(`sha${index}`, `${index} minutes ago`, `feat: change ${index}`),
		);

		const report = render({ commits: many, pulled: true });

		for (const entry of many) {
			expect(report).toContain(
				`| \`${entry.short}\` | ${entry.when} | ${entry.subject} |`,
			);
		}
		expect(report).not.toContain("← new");
	});

	it("says no new commits when the pull brought none in", () => {
		const report = render({ commits: [], pulled: true });

		expect(report).toContain("_no new commits_");
		expect(report).not.toContain("| SHA |");
	});

	it("escapes pipes in a subject so the table survives", () => {
		const report = render({
			version: "0.1.0",
			commits: [commit("ddd4444", "just now", "fix: pipe | in subject")],
		});

		expect(report).toContain(
			"| `ddd4444` | just now | fix: pipe \\| in subject |",
		);
	});

	it("lists every restart the pull makes necessary", () => {
		const report = render({
			restarts: [
				"restart the web server, then hard-reload the browser tab",
				"restart the daemon",
			],
		});

		expect(report).toContain(
			[
				"**Restarts**",
				"",
				"- restart the web server, then hard-reload the browser tab",
				"- restart the daemon",
			].join("\n"),
		);
	});

	it("says none needed when no restart is required", () => {
		expect(render()).toContain("**Restarts**\n\n- none needed");
	});

	it("lists every reason the pull makes a sync necessary", () => {
		const report = render({
			syncs: ["claude/commands changed", "claude/settings.json changed"],
		});

		expect(report).toContain(
			[
				"**Sync**",
				"",
				"- claude/commands changed",
				"- claude/settings.json changed",
			].join("\n"),
		);
	});

	it("says not needed when no sync is required", () => {
		expect(render()).toContain("**Sync**\n\n- not needed");
	});

	it("renders the Sync section after the Restarts section", () => {
		const report = render({
			restarts: ["restart the daemon"],
			syncs: ["claude/settings.json changed"],
		});

		expect(report.indexOf("**Sync**")).toBeGreaterThan(
			report.indexOf("**Restarts**"),
		);
	});

	it("handles a repository with no commits", () => {
		const report = render({ version: "0.0.0", commits: [] });

		expect(report).toContain("_no commits_");
		expect(report).not.toContain("| SHA |");
	});
});
