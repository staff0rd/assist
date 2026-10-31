import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findDeclaredScreenshot } from "./findDeclaredScreenshot";

let dir: string;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "docs-shared-"));
	writeFileSync(
		join(dir, "a.md"),
		"---\nid: a\ntitle: A\ngroup: Sessions\norder: 0\ncovers: []\nscreenshots:\n  - file: a.png\n    alt: A shot\n    route: /a\n---\n",
	);
});

afterEach(() => {
	rmSync(dir, { recursive: true, force: true });
});

describe("findDeclaredScreenshot", () => {
	it("finds a screenshot declared on any page", () => {
		expect(findDeclaredScreenshot("a.png", dir)?.alt).toBe("A shot");
	});

	it("returns undefined for a file no page declares", () => {
		expect(findDeclaredScreenshot("b.png", dir)).toBeUndefined();
	});
});
