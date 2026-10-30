import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfigFrom } from "../../shared/loadConfigFrom";
import { REDACTED_SECRET } from "../../shared/redactConfigSecrets";
import { readConfigEntries } from "./readConfigEntries";

const root = join(tmpdir(), "assist-read-config-entries-test");
const home = join(root, "home");
const repo = join(root, "repo");
const repoConfig = join(repo, "assist.yml");
const globalConfig = join(home, ".assist.yml");
const repoOriginKey = `local:${repo}`;

mkdirSync(repo, { recursive: true });
mkdirSync(home, { recursive: true });

afterAll(() => {
	vi.unstubAllEnvs();
	rmSync(root, { recursive: true, force: true });
});

function entryFor(key: string) {
	const entry = readConfigEntries(repo).find((e) => e.key === key);
	if (!entry) throw new Error(`no entry for ${key}`);
	return entry;
}

describe("readConfigEntries", () => {
	beforeEach(() => {
		vi.stubEnv("HOME", home);
		writeFileSync(repoConfig, "");
		writeFileSync(globalConfig, "");
	});

	it("attributes a key set in the repo's assist.yml to the project", () => {
		writeFileSync(repoConfig, "commit:\n  push: true\n");

		expect(entryFor("commit.push")).toMatchObject({
			value: true,
			source: "project",
		});
	});

	it("attributes a key set only in the global config to global", () => {
		writeFileSync(globalConfig, "backup:\n  dir: ~/elsewhere\n");

		expect(entryFor("backup.dir")).toMatchObject({
			value: "~/elsewhere",
			source: "global",
		});
	});

	it("prefers the project value when both files set the key", () => {
		writeFileSync(globalConfig, "commit:\n  push: false\n");
		writeFileSync(repoConfig, "commit:\n  push: true\n");

		expect(entryFor("commit.push")).toMatchObject({
			value: true,
			source: "project",
		});
	});

	it("marks an unset key as coming from the schema default", () => {
		const entry = entryFor("commit.push");

		expect(entry.source).toBe("default");
		expect(entry.value).toBe(false);
	});

	it("limits the writable scopes of global-only and node-only keys", () => {
		expect(entryFor("sync.autoConfirm").writableScopes).toEqual(["global"]);
		expect(entryFor("database.url").writableScopes).toEqual([
			"project",
			"repo",
			"global",
		]);
		expect(entryFor("commit.push").writableScopes).toBeUndefined();
	});

	it("carries a descriptor node for every leaf", () => {
		expect(entryFor("sql.connections").node).toMatchObject({
			kind: "objectList",
			item: { kind: "object" },
		});
		expect(entryFor("devlog.skip").node).toMatchObject({ kind: "record" });
		expect(entryFor("run").node).toMatchObject({
			kind: "objectList",
			item: { kind: "unionOfObjects" },
		});
		expect(entryFor("commit.push").node).toMatchObject({
			kind: "scalar",
			type: "boolean",
		});
	});

	it("keeps global siblings when a repos override sets one nested key", () => {
		writeFileSync(
			globalConfig,
			`repos:\n  "${repoOriginKey}":\n    worktree:\n      enabled: true\nworktree:\n  trunk: true\n`,
		);

		expect(entryFor("worktree.trunk")).toMatchObject({
			value: true,
			source: "global",
		});
		expect(entryFor("worktree.enabled")).toMatchObject({
			value: true,
			source: "repo",
			repoKey: repoOriginKey,
		});
	});

	it("names the matching repos key on keys the override does not set", () => {
		writeFileSync(
			globalConfig,
			`repos:\n  "${repoOriginKey}":\n    worktree:\n      enabled: true\n`,
		);

		expect(entryFor("commit.push")).toMatchObject({
			source: "default",
			repoKey: repoOriginKey,
		});
	});

	it("leaves repoKey unset when no repos entry matches the repo", () => {
		writeFileSync(
			globalConfig,
			"repos:\n  other/repo:\n    commit:\n      push: true\n",
		);

		expect(entryFor("commit.push").repoKey).toBeUndefined();
	});

	it("prefers the project value over a repos override", () => {
		writeFileSync(
			globalConfig,
			`repos:\n  "${repoOriginKey}":\n    commit:\n      push: false\n`,
		);
		writeFileSync(repoConfig, "commit:\n  push: true\n");

		expect(entryFor("commit.push")).toMatchObject({
			value: true,
			source: "project",
			sources: ["project", "repo"],
		});
	});

	it("lists every layer that sets the key", () => {
		writeFileSync(globalConfig, "commit:\n  push: false\n");
		writeFileSync(repoConfig, "commit:\n  push: true\n");

		expect(entryFor("commit.push").sources).toEqual(["project", "global"]);
		expect(entryFor("worktree.trunk").sources).toEqual([]);
	});

	it("carries each layer's own raw array instead of only the merged value", () => {
		writeFileSync(globalConfig, "run:\n  - name: build\n    command: g\n");
		writeFileSync(repoConfig, "run:\n  - name: test\n    command: p\n");

		const entry = entryFor("run");

		expect(entry.layers).toEqual({
			global: [{ name: "build", command: "g" }],
			project: [{ name: "test", command: "p" }],
		});
		expect(entry.value).toHaveLength(2);
	});

	it("carries the repos override layer separately from the global layer", () => {
		writeFileSync(
			globalConfig,
			`run:\n  - name: build\n    command: g\nrepos:\n  "${repoOriginKey}":\n    run:\n      - name: deploy\n        command: r\n`,
		);

		expect(entryFor("run").layers).toEqual({
			global: [{ name: "build", command: "g" }],
			repo: [{ name: "deploy", command: "r" }],
		});
	});

	it("omits layers that do not set the key", () => {
		writeFileSync(repoConfig, "commit:\n  push: true\n");

		expect(entryFor("commit.push").layers).toEqual({ project: true });
		expect(entryFor("worktree.trunk").layers).toEqual({});
	});

	it("withholds secrets from the per-layer raw values", () => {
		writeFileSync(
			globalConfig,
			"sql:\n  connections:\n    - name: main\n      server: localhost\n      port: 1433\n      user: sa\n      password: hunter2\n      database: app\n",
		);

		const entry = entryFor("sql.connections");

		expect(entry.layers?.global).toEqual([
			{
				name: "main",
				server: "localhost",
				port: 1433,
				user: "sa",
				password: REDACTED_SECRET,
				database: "app",
			},
		]);
		expect(JSON.stringify(entry)).not.toContain("hunter2");
	});

	it("withholds a secret scalar's value while keeping its source", () => {
		writeFileSync(repoConfig, "database:\n  url: postgres://u:p@host/db\n");

		const entry = entryFor("database.url");

		expect(entry.value).toEqual(REDACTED_SECRET);
		expect(entry.source).toBe("project");
		expect(JSON.stringify(entry)).not.toContain("u:p@host/db");
	});

	it("leaves an unset secret without a value so it reads as not set", () => {
		expect(entryFor("database.url").value).toBeUndefined();
		expect(entryFor("litellm.apiKey").value).toBeUndefined();
	});

	it("withholds a secret nested in an array of objects and keeps its siblings", () => {
		writeFileSync(
			globalConfig,
			"sql:\n  connections:\n    - name: main\n      server: localhost\n      port: 1433\n      user: sa\n      password: hunter2\n      database: app\n",
		);

		const entry = entryFor("sql.connections");

		expect(entry.value).toEqual([
			{
				name: "main",
				server: "localhost",
				port: 1433,
				user: "sa",
				password: REDACTED_SECRET,
				database: "app",
			},
		]);
		expect(entry.source).toBe("global");
		expect(JSON.stringify(entry)).not.toContain("hunter2");
	});

	it("keeps returning real secret values from loadConfigFrom", () => {
		writeFileSync(globalConfig, "database:\n  url: postgres://u:p@host/db\n");

		expect(loadConfigFrom(repo).database?.url).toBe("postgres://u:p@host/db");
	});

	it("carries the configHelp note and setter for documented keys", () => {
		expect(entryFor("backup.dir")).toMatchObject({
			note: "directory dumps are written to (default: ~/.assist/backups)",
			setter: "assist config set backup.dir ~/.assist/backups",
		});
		expect(entryFor("sql.connections").setter).toBe("assist sql auth add");
	});

	it("reports the schema default for a leaf under an unset optional parent", () => {
		const entry = entryFor("worktree.enabled");

		expect(entry.source).toBe("default");
		expect(entry.value).toBeUndefined();
		expect(entry.defaultValue).toBe(false);
	});
});
