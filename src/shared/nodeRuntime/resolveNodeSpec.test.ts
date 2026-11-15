import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ResolveNodeDeps } from "./NodeSpecResolution";
import { resolveNodeSpec } from "./resolveNodeSpec";

let home: string;

function install(...segments: string[]): string {
	const path = join(home, ...segments);
	mkdirSync(join(path, ".."), { recursive: true });
	writeFileSync(path, "");
	return path;
}

function fnmNode(version: string): string {
	return install(
		".local/share/fnm/node-versions",
		`v${version}`,
		"installation/bin/node",
	);
}

function deps(overrides: Partial<ResolveNodeDeps> = {}): ResolveNodeDeps {
	return {
		home,
		env: {},
		platform: "linux",
		current: { path: "/usr/bin/node", version: "v22.21.1" },
		versionOf: () => "v24.0.0",
		...overrides,
	};
}

describe("resolveNodeSpec", () => {
	beforeEach(() => {
		home = mkdtempSync(join(tmpdir(), "resolve-node-"));
	});
	afterEach(() => rmSync(home, { recursive: true, force: true }));

	it("picks the highest installed fnm version matching a major", () => {
		fnmNode("22.21.1");
		fnmNode("24.16.0");
		const newest = fnmNode("24.22.1");

		expect(resolveNodeSpec("24", deps())).toEqual({
			ok: true,
			node: { path: newest, binDir: join(newest, ".."), version: "24.22.1" },
		});
	});

	it("matches an exact v-prefixed nvm version", () => {
		const path = install(".nvm/versions/node/v24.22.1/bin/node");
		install(".nvm/versions/node/v24.23.0/bin/node");

		expect(resolveNodeSpec("v24.22.1", deps())).toMatchObject({
			ok: true,
			node: { path, version: "24.22.1" },
		});
	});

	it("keeps the current node when it already satisfies the spec", () => {
		fnmNode("22.23.4");

		expect(resolveNodeSpec("22", deps())).toMatchObject({
			ok: true,
			node: { path: "/usr/bin/node", binDir: "/usr/bin", version: "22.21.1" },
		});
	});

	it("resolves an explicit install dir to its bin/node", () => {
		const path = install("custom/node-24/bin/node");

		expect(resolveNodeSpec("~/custom/node-24", deps())).toEqual({
			ok: true,
			node: { path, binDir: join(path, ".."), version: "24.0.0" },
		});
	});

	it("reports versions it found when none matches", () => {
		fnmNode("22.21.1");

		expect(resolveNodeSpec("26", deps())).toEqual({
			ok: false,
			error:
				"no installed node satisfies it (searched fnm, nvm and volta; found 22.21.1)",
		});
	});

	it("rejects a spec that is neither a version nor a path", () => {
		expect(resolveNodeSpec("lts/iron", deps())).toMatchObject({ ok: false });
	});
});
