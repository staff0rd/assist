import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveInstallNode } from "./resolveInstallNode";

let tree: string;

const node24 = {
	path: "/fnm/v24.22.1/bin/node",
	binDir: "/fnm/v24.22.1/bin",
	version: "24.22.1",
};

function deps(
	declared?: { spec: string } & (
		| { ok: true; node: typeof node24 }
		| { ok: false; error: string }
	),
) {
	return {
		resolve: vi.fn((_spec: string) => ({ ok: true as const, node: node24 })),
		declared: () => declared,
	};
}

function pin(rel: string, content: string): string {
	const file = join(tree, rel);
	mkdirSync(join(file, ".."), { recursive: true });
	writeFileSync(file, content);
	return file;
}

describe("resolveInstallNode", () => {
	beforeEach(() => {
		tree = mkdtempSync(join(tmpdir(), "install-node-"));
		mkdirSync(join(tree, "coach-tools", "src"), { recursive: true });
	});
	afterEach(() => rmSync(tree, { recursive: true, force: true }));

	it("resolves the nearest pin above the install dir within the worktree", () => {
		const file = pin(".node-version", "24\n");
		const d = deps();

		const node = resolveInstallNode(join(tree, "coach-tools"), tree, d);

		expect(d.resolve).toHaveBeenCalledWith("24");
		expect(node).toEqual({
			ok: true,
			binDir: "/fnm/v24.22.1/bin",
			description: `node v24.22.1 (/fnm/v24.22.1/bin) pinned by ${file}`,
		});
	});

	it("prefers a pin in the install dir over one at the worktree root", () => {
		pin(".node-version", "22");
		pin("coach-tools/.nvmrc", "v24.22.1");
		const d = deps();

		resolveInstallNode(join(tree, "coach-tools"), tree, d);

		expect(d.resolve).toHaveBeenCalledWith("v24.22.1");
	});

	it("ignores pins above the worktree root", () => {
		pin(".node-version", "24");
		const d = deps();

		const node = resolveInstallNode(
			join(tree, "coach-tools", "src"),
			join(tree, "coach-tools"),
			d,
		);

		expect(d.resolve).not.toHaveBeenCalled();
		expect(node).toMatchObject({ ok: true, binDir: undefined });
	});

	it("falls back to the daemon's declared node when nothing is pinned", () => {
		const node = resolveInstallNode(
			join(tree, "coach-tools"),
			tree,
			deps({ spec: "24", ok: true, node: node24 }),
		);

		expect(node).toEqual({
			ok: true,
			binDir: "/fnm/v24.22.1/bin",
			description:
				"the daemon's node v24.22.1 (/fnm/v24.22.1/bin) from sessions.nodeVersion; no .node-version or .nvmrc",
		});
	});

	it("leaves PATH alone when nothing is pinned and no node is declared", () => {
		expect(
			resolveInstallNode(join(tree, "coach-tools"), tree, deps()),
		).toMatchObject({ ok: true, binDir: undefined });
	});

	it("fails with the resolution error rather than using another node", () => {
		const file = pin(".nvmrc", "26");
		const d = {
			...deps(),
			resolve: () => ({
				ok: false as const,
				error: "no installed node satisfies it",
			}),
		};

		expect(resolveInstallNode(join(tree, "coach-tools"), tree, d)).toEqual({
			ok: false,
			error: `${file} pins node "26" but it could not be resolved: no installed node satisfies it`,
		});
	});
});
