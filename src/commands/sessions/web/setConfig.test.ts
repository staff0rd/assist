import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { parse as parseYaml } from "yaml";

const globalConfigPath = vi.hoisted(() => ({ path: "" }));

const mockRespondJson = vi.fn();

vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

vi.mock("../../../shared/loadConfigFrom", async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return { ...actual, getGlobalConfigPath: () => globalConfigPath.path };
});

import { tmpdir } from "node:os";
import { join } from "node:path";
import { REDACTED_SECRET } from "../../../shared/redactConfigSecrets";
import { setConfig } from "./setConfig";

const root = join(tmpdir(), "assist-set-config-test");
const paths = {
	root,
	repo: join(root, "repo"),
	repoConfig: join(root, "repo", "assist.yml"),
	globalConfig: join(root, "home", ".assist.yml"),
};
globalConfigPath.path = paths.globalConfig;

mkdirSync(paths.repo, { recursive: true });
mkdirSync(join(root, "home"), { recursive: true });

afterAll(() => {
	vi.unstubAllEnvs();
	rmSync(paths.root, { recursive: true, force: true });
});

async function post(body: unknown): Promise<[number, Record<string, unknown>]> {
	const req = Readable.from([
		Buffer.from(JSON.stringify(body)),
	]) as unknown as IncomingMessage;
	await setConfig(req, {} as ServerResponse);
	const [, status, payload] = mockRespondJson.mock.lastCall as [
		ServerResponse,
		number,
		Record<string, unknown>,
	];
	return [status, payload];
}

function readYaml(path: string): Record<string, unknown> {
	return parseYaml(readFileSync(path, "utf8")) as Record<string, unknown>;
}

describe("setConfig", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubEnv("HOME", join(root, "home"));
		writeFileSync(paths.repoConfig, "commit:\n  push: false\n");
		writeFileSync(paths.globalConfig, "commit:\n  pull: false\n");
	});

	it("writes a scalar to the repo's assist.yml", async () => {
		const [status, payload] = await post({
			key: "commit.push",
			value: true,
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(200);
		expect(payload.target).toBe("project");
		expect(readYaml(paths.repoConfig)).toEqual({ commit: { push: true } });
		expect(readYaml(paths.globalConfig)).toEqual({ commit: { pull: false } });
	});

	it("writes a scalar to the global config when scope is global", async () => {
		const [status, payload] = await post({
			key: "backup.dir",
			value: "~/elsewhere",
			cwd: paths.repo,
			scope: "global",
		});

		expect(status).toBe(200);
		expect(payload.target).toBe("global");
		expect(readYaml(paths.globalConfig)).toEqual({
			commit: { pull: false },
			backup: { dir: "~/elsewhere" },
		});
		expect(readYaml(paths.repoConfig)).toEqual({ commit: { push: false } });
	});

	it("coerces a string body value to the schema's number type", async () => {
		const [status] = await post({
			key: "sessions.maxLive",
			value: "4310",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(200);
		expect(readYaml(paths.repoConfig)).toEqual({
			commit: { push: false },
			sessions: { maxLive: 4310 },
		});
	});

	it("rejects a value the schema refuses and leaves the file untouched", async () => {
		const [status, payload] = await post({
			key: "sessions.linkVersionCheck",
			value: "sometimes",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(400);
		expect(payload.errors).toEqual([
			expect.stringContaining("sessions.linkVersionCheck"),
		]);
		expect(readFileSync(paths.repoConfig, "utf8")).toBe(
			"commit:\n  push: false\n",
		);
	});

	it("rejects a non-numeric value for a number key", async () => {
		const [status, payload] = await post({
			key: "sessions.maxLive",
			value: "soon",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(400);
		expect(payload.error).toContain("expected a number");
		expect(readFileSync(paths.repoConfig, "utf8")).toBe(
			"commit:\n  push: false\n",
		);
	});

	it("writes the boolean member of a scalar union", async () => {
		const [status] = await post({
			key: "worktree.install",
			value: "false",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(200);
		expect(readYaml(paths.repoConfig)).toEqual({
			commit: { push: false },
			worktree: { install: false },
		});
	});

	it("writes the string member of a scalar union", async () => {
		const [status] = await post({
			key: "worktree.install",
			value: "pnpm install --frozen-lockfile",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(200);
		expect(readYaml(paths.repoConfig)).toEqual({
			commit: { push: false },
			worktree: { install: "pnpm install --frozen-lockfile" },
		});
	});

	it("writes a list of strings to an array-of-scalars key", async () => {
		const [status] = await post({
			key: "worktree.copy",
			value: [".env", ".claude/settings.local.json"],
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(200);
		expect(readYaml(paths.repoConfig)).toEqual({
			commit: { push: false },
			worktree: { copy: [".env", ".claude/settings.local.json"] },
		});
	});

	it("writes an empty list to an array-of-scalars key", async () => {
		const [status] = await post({
			key: "worktree.copy",
			value: [],
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(200);
		expect(readYaml(paths.repoConfig)).toEqual({
			commit: { push: false },
			worktree: { copy: [] },
		});
	});

	it("rejects a non-list value for an array-of-scalars key", async () => {
		const [status, payload] = await post({
			key: "worktree.copy",
			value: ".env",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(400);
		expect(payload.error).toContain("expected a list of string values");
		expect(readFileSync(paths.repoConfig, "utf8")).toBe(
			"commit:\n  push: false\n",
		);
	});

	it("rejects a list whose entries are the wrong type", async () => {
		const [status, payload] = await post({
			key: "worktree.copy",
			value: [".env", 7],
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(400);
		expect(payload.error).toContain("expected a string");
		expect(readFileSync(paths.repoConfig, "utf8")).toBe(
			"commit:\n  push: false\n",
		);
	});

	it("writes an array of objects", async () => {
		const connections = [
			{
				name: "local",
				server: "localhost",
				port: 1433,
				user: "sa",
				password: "secret",
				database: "app",
			},
		];
		const [status] = await post({
			key: "sql.connections",
			value: connections,
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(200);
		expect(readYaml(paths.repoConfig)).toEqual({
			commit: { push: false },
			sql: { connections },
		});
	});

	it("keeps the stored secret when the redaction marker comes back untouched", async () => {
		const stored = {
			name: "local",
			server: "localhost",
			port: 1433,
			user: "sa",
			password: "hunter2",
			database: "app",
		};
		writeFileSync(
			paths.repoConfig,
			`sql:\n  connections:\n    - name: local\n      server: localhost\n      port: 1433\n      user: sa\n      password: hunter2\n      database: app\n`,
		);

		const [status] = await post({
			key: "sql.connections",
			value: [{ ...stored, port: 1434, password: REDACTED_SECRET }],
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(200);
		expect(readYaml(paths.repoConfig)).toEqual({
			sql: { connections: [{ ...stored, port: 1434 }] },
		});
	});

	it("replaces the stored secret when a new value is supplied", async () => {
		writeFileSync(paths.repoConfig, "database:\n  url: postgres://old\n");

		const [status] = await post({
			key: "database.url",
			value: "postgres://new",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(200);
		expect(readYaml(paths.repoConfig)).toEqual({
			database: { url: "postgres://new" },
		});
	});

	it("keeps the stored secret when a scalar secret row is saved untouched", async () => {
		writeFileSync(paths.repoConfig, "database:\n  url: postgres://old\n");

		const [status] = await post({
			key: "database.url",
			value: REDACTED_SECRET,
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(200);
		expect(readYaml(paths.repoConfig)).toEqual({
			database: { url: "postgres://old" },
		});
	});

	it("keeps the submitted secret out of a rejected write's error", async () => {
		const [status, payload] = await post({
			key: "sql.connections",
			value: [
				{
					name: "local",
					server: "localhost",
					port: "1433",
					user: "sa",
					password: "hunter2",
					database: "app",
					mode: "readonly",
				},
			],
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(400);
		expect(payload.error).toContain("sql.connections");
		expect(JSON.stringify(payload)).not.toContain("hunter2");
		expect(readFileSync(paths.repoConfig, "utf8")).toBe(
			"commit:\n  push: false\n",
		);
	});

	it("keeps a stored secret out of an unrelated key's rejected write", async () => {
		writeFileSync(
			paths.repoConfig,
			"database:\n  url: postgres://user:hunter2@host/db\n",
		);

		const [status, payload] = await post({
			key: "sessions.linkVersionCheck",
			value: "sometimes",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(400);
		expect(JSON.stringify(payload)).not.toContain("hunter2");
	});

	it("rejects the marker for a secret that is not stored anywhere", async () => {
		const [status, payload] = await post({
			key: "database.url",
			value: REDACTED_SECRET,
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(400);
		expect(payload.error).toContain("database.url");
		expect(readFileSync(paths.repoConfig, "utf8")).toBe(
			"commit:\n  push: false\n",
		);
	});

	it("writes a record of lists", async () => {
		const [status] = await post({
			key: "cliReadVerbs",
			value: { docker: ["ps", "logs"] },
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(200);
		expect(readYaml(paths.repoConfig)).toEqual({
			commit: { push: false },
			cliReadVerbs: { docker: ["ps", "logs"] },
		});
	});

	it("writes a run entry with a nested params array and env record", async () => {
		const run = [
			{
				name: "deploy",
				command: "sh",
				params: [{ name: "stage", required: true }],
				env: { LOG: "debug" },
			},
			{ link: "shared.yml", prefix: "shared" },
		];
		const [status] = await post({
			key: "run",
			value: run,
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(200);
		expect(readYaml(paths.repoConfig)).toEqual({
			commit: { push: false },
			run,
		});
	});

	it("rejects an invalid nested value and leaves the file untouched", async () => {
		const [status, payload] = await post({
			key: "sql.connections",
			value: [
				{
					name: "local",
					server: "localhost",
					port: "soon",
					user: "sa",
					password: "secret",
					database: "app",
				},
			],
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(400);
		expect(payload.error).toContain("sql.connections[0].port");
		expect(readFileSync(paths.repoConfig, "utf8")).toBe(
			"commit:\n  push: false\n",
		);
	});

	it("rejects a nested entry missing a required field", async () => {
		const [status, payload] = await post({
			key: "run",
			value: [{ name: "build" }],
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(400);
		expect(payload.error).toContain("run[0]");
		expect(readFileSync(paths.repoConfig, "utf8")).toBe(
			"commit:\n  push: false\n",
		);
	});

	it("rejects a complex leaf given a scalar", async () => {
		const [status, payload] = await post({
			key: "sql.connections",
			value: "nope",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(400);
		expect(payload.error).toContain("sql.connections");
		expect(readFileSync(paths.repoConfig, "utf8")).toBe(
			"commit:\n  push: false\n",
		);
	});

	it("rejects an unknown key", async () => {
		const [status, payload] = await post({
			key: "bogus.key",
			value: "x",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(400);
		expect(payload.error).toContain("Unknown config key");
	});

	it("rejects a project write of a global-only key", async () => {
		const [status, payload] = await post({
			key: "sync.autoConfirm",
			value: true,
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(400);
		expect(payload.error).toContain("global-only");
		expect(readFileSync(paths.repoConfig, "utf8")).toBe(
			"commit:\n  push: false\n",
		);
	});

	it("accepts a global write of a global-only key", async () => {
		const [status, payload] = await post({
			key: "sync.autoConfirm",
			value: true,
			cwd: paths.repo,
			scope: "global",
		});

		expect(status).toBe(200);
		expect(payload.target).toBe("global");
		expect(readYaml(paths.globalConfig)).toEqual({
			commit: { pull: false },
			sync: { autoConfirm: true },
		});
		expect(readYaml(paths.repoConfig)).toEqual({ commit: { push: false } });
	});

	it("rejects a missing cwd or scope", async () => {
		const [noCwd] = await post({ key: "commit.push", value: true });
		expect(noCwd).toBe(400);

		const [badScope] = await post({
			key: "commit.push",
			value: true,
			cwd: paths.repo,
			scope: "everywhere",
		});
		expect(badScope).toBe(400);
	});

	it("writes under repos[label] in the global config for the repo scope", async () => {
		const [status, payload] = await post({
			key: "worktree.enabled",
			value: true,
			cwd: paths.repo,
			scope: "repo",
		});

		expect(status).toBe(200);
		expect(payload).toEqual({ target: "repo", repoKey: "repo" });
		expect(readYaml(paths.globalConfig)).toEqual({
			commit: { pull: false },
			repos: { repo: { worktree: { enabled: true } } },
		});
		expect(readYaml(paths.repoConfig)).toEqual({ commit: { push: false } });
	});

	it("stacks a repo-scoped write into an existing repos entry", async () => {
		writeFileSync(
			paths.globalConfig,
			"repos:\n  repo:\n    worktree:\n      trunk: true\n",
		);

		const [status] = await post({
			key: "worktree.enabled",
			value: true,
			cwd: paths.repo,
			scope: "repo",
		});

		expect(status).toBe(200);
		expect(readYaml(paths.globalConfig)).toEqual({
			repos: { repo: { worktree: { trunk: true, enabled: true } } },
		});
	});

	it("writes a complex leaf to the repo scope", async () => {
		const connections = [{ name: "prod", url: "https://seq", apiToken: "t" }];
		const [status] = await post({
			key: "seq.connections",
			value: connections,
			cwd: paths.repo,
			scope: "repo",
		});

		expect(status).toBe(200);
		expect(readYaml(paths.globalConfig)).toEqual({
			commit: { pull: false },
			repos: { repo: { seq: { connections } } },
		});
	});

	it("rejects a repo-scoped value the schema refuses and leaves the file untouched", async () => {
		const [status, payload] = await post({
			key: "sessions.linkVersionCheck",
			value: "sometimes",
			cwd: paths.repo,
			scope: "repo",
		});

		expect(status).toBe(400);
		expect(payload.errors).toEqual([
			expect.stringContaining("sessions.linkVersionCheck"),
		]);
		expect(readFileSync(paths.globalConfig, "utf8")).toBe(
			"commit:\n  pull: false\n",
		);
	});

	it("rejects a repo-scoped write of a global-only key", async () => {
		const [status, payload] = await post({
			key: "sync.autoConfirm",
			value: true,
			cwd: paths.repo,
			scope: "repo",
		});

		expect(status).toBe(400);
		expect(payload.error).toContain("global-only");
		expect(readFileSync(paths.globalConfig, "utf8")).toBe(
			"commit:\n  pull: false\n",
		);
	});
});
