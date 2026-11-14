import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { listDeclaredScreenshots } from "./listDeclaredScreenshots";

describe("listDeclaredScreenshots", () => {
	it("collects each page's screenshot files with their dark variants", () => {
		const dir = mkdtempSync(join(tmpdir(), "declared-"));
		writeFileSync(
			join(dir, "rules.md"),
			"---\nid: rules\nscreenshots:\n  - file: rules.png\n  - file: phone.png\n    theme: dark\n---\nBody\n",
		);
		writeFileSync(join(dir, "plain.md"), "---\nid: plain\n---\n");
		writeFileSync(join(dir, "broken.md"), "no frontmatter");

		expect([...listDeclaredScreenshots(dir)].sort()).toEqual([
			"phone.png",
			"rules-dark.png",
			"rules.png",
		]);
	});

	it("returns nothing when the pages directory is missing", () => {
		expect(
			listDeclaredScreenshots(join(tmpdir(), "no-such-pages-dir")).size,
		).toBe(0);
	});
});
