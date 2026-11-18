import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NodeSpecResolution } from "./NodeSpecResolution";
import { repoNode } from "./repoNode";

let tree: string;

const node24 = {
	path: "/fnm/v24.22.1/bin/node",
	binDir: "/fnm/v24.22.1/bin",
	version: "24.22.1",
};

const found = vi.fn((_spec: string, _highest: boolean): NodeSpecResolution => ({
	ok: true,
	node: node24,
}));

function write(rel: string, content: string): string {
	const file = join(tree, rel);
	mkdirSync(join(file, ".."), { recursive: true });
	writeFileSync(file, content);
	return file;
}

describe("repoNode", () => {
	beforeEach(() => {
		tree = mkdtempSync(join(tmpdir(), "repo-node-"));
		mkdirSync(join(tree, ".git"));
		mkdirSync(join(tree, "api", "src"), { recursive: true });
		found.mockClear();
	});
	afterEach(() => rmSync(tree, { recursive: true, force: true }));

	it("resolves the root .node-version from a nested cwd", () => {
		const file = write(".node-version", "24\n");
		expect(repoNode(join(tree, "api", "src"), found)).toEqual({
			pin: { file, spec: "24" },
			ok: true,
			node: node24,
		});
		expect(found).toHaveBeenCalledWith("24", false);
	});

	it("prefers .node-version over .nvmrc in the same directory", () => {
		write(".nvmrc", "22");
		write(".node-version", "24");
		expect(repoNode(tree, found)?.pin.spec).toBe("24");
	});

	it("reads .nvmrc when there is no .node-version", () => {
		write(".nvmrc", "v24.1.0");
		expect(repoNode(tree, found)?.pin.spec).toBe("v24.1.0");
	});

	it("prefers a version file over engines.node", () => {
		write(".node-version", "24");
		write("api/package.json", JSON.stringify({ engines: { node: ">=22" } }));
		expect(repoNode(join(tree, "api"), found)?.pin.spec).toBe("24");
	});

	it("falls back to the nearest package.json engines.node range", () => {
		write("package.json", JSON.stringify({ engines: { node: ">=20" } }));
		const file = write(
			"api/package.json",
			JSON.stringify({ engines: { node: ">=24" } }),
		);
		expect(repoNode(join(tree, "api", "src"), found)?.pin).toEqual({
			file,
			spec: ">=24",
		});
		expect(found).toHaveBeenCalledWith(">=24", true);
	});

	it("does not look above the repo root", () => {
		const outer = mkdtempSync(join(tmpdir(), "repo-node-outer-"));
		try {
			writeFileSync(join(outer, ".node-version"), "18");
			const repo = join(outer, "repo");
			mkdirSync(join(repo, ".git"), { recursive: true });
			expect(repoNode(repo, found)).toBeUndefined();
		} finally {
			rmSync(outer, { recursive: true, force: true });
		}
	});

	it("returns nothing for a repo with no pin", () => {
		write("package.json", JSON.stringify({ name: "x" }));
		expect(repoNode(join(tree, "api"), found)).toBeUndefined();
		expect(found).not.toHaveBeenCalled();
	});

	it("reports the pin when no installed node satisfies it", () => {
		const file = write(".node-version", "26");
		const missing = (_spec: string): NodeSpecResolution => ({
			ok: false,
			error: "no installed node satisfies it",
		});
		expect(repoNode(tree, missing)).toEqual({
			pin: { file, spec: "26" },
			ok: false,
			error: "no installed node satisfies it",
		});
	});
});
