import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { unpostedWeeks } from "./unpostedWeeks";

let devDir: string;

function writeEntry(name: string, frontmatter: string): void {
	writeFileSync(
		join(devDir, "yoke", name),
		`---\nproject: "yoke"\n${frontmatter}---\n\nLede.\n`,
	);
}

beforeEach(() => {
	devDir = mkdtempSync(join(tmpdir(), "devlog-unposted-"));
	mkdirSync(join(devDir, "yoke"));
});

afterEach(() => {
	rmSync(devDir, { recursive: true, force: true });
});

describe("unpostedWeeks", () => {
	it("lists entries without a slack key, oldest first", () => {
		writeEntry("2026-w44.md", "");
		writeEntry("2026-w42.md", "");
		writeEntry("2026-w43.md", 'slack: "https://x.slack.com/p1"\n');
		writeEntry("2026-w41.md", 'slack: "skipped"\n');
		expect(unpostedWeeks("yoke", devDir)).toEqual(["2026-W42", "2026-W44"]);
	});

	it("returns nothing when every entry is posted or there are none", () => {
		expect(unpostedWeeks("yoke", devDir)).toEqual([]);
		writeEntry("2026-w42.md", 'slack: "skipped"\n');
		expect(unpostedWeeks("yoke", devDir)).toEqual([]);
	});
});
