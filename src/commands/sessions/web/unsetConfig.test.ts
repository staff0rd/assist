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

let orm: Db;

vi.mock("../../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
}));

import { tmpdir } from "node:os";
import { join } from "node:path";
import { createTestDb } from "../../../shared/db/createTestDb";
import type { Db } from "../../../shared/db/Db";
import { listRepoConfigs } from "../../../shared/db/listRepoConfigs";
import { readRepoConfigCache } from "../../../shared/readRepoConfigCache";
import { writeRepoConfigCache } from "../../../shared/writeRepoConfigCache";
import { seedRepoConfigs } from "../../../test/mothers/seedRepoConfigs";
import { unsetConfig } from "./unsetConfig";

const root = join(tmpdir(), "assist-unset-config-test");
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
	rmSync(paths.root, { recursive: true, force: true });
});

async function post(body: unknown): Promise<[number, Record<string, unknown>]> {
	const req = Readable.from([
		Buffer.from(JSON.stringify(body)),
	]) as unknown as IncomingMessage;
	await unsetConfig(req, {} as ServerResponse);
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

const originKey = `local:${paths.repo}`;

describe("unsetConfig", () => {
	beforeEach(async () => {
		({ orm } = await createTestDb());
		writeRepoConfigCache({});
		vi.clearAllMocks();
		writeFileSync(paths.repoConfig, "commit:\n  push: false\n  pull: true\n");
		writeFileSync(paths.globalConfig, "commit:\n  pull: false\n");
	});

	it("removes the key from the repo's assist.yml", async () => {
		const [status, payload] = await post({
			key: "commit.push",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(200);
		expect(payload).toEqual({ target: "project", removed: true });
		expect(readYaml(paths.repoConfig)).toEqual({ commit: { pull: true } });
		expect(readYaml(paths.globalConfig)).toEqual({ commit: { pull: false } });
	});

	it("removes the key from the global config when scope is global", async () => {
		const [status, payload] = await post({
			key: "commit.pull",
			cwd: paths.repo,
			scope: "global",
		});

		expect(status).toBe(200);
		expect(payload).toEqual({ target: "global", removed: true });
		expect(readYaml(paths.globalConfig)).toEqual({});
		expect(readYaml(paths.repoConfig)).toEqual({
			commit: { push: false, pull: true },
		});
	});

	it("prunes the parent left empty by the removal", async () => {
		writeFileSync(paths.repoConfig, "worktree:\n  enabled: true\n");

		const [status] = await post({
			key: "worktree.enabled",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(200);
		expect(readYaml(paths.repoConfig)).toEqual({});
	});

	it("reports the key was already absent without writing", async () => {
		const [status, payload] = await post({
			key: "worktree.enabled",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(200);
		expect(payload).toEqual({ target: "project", removed: false });
		expect(readFileSync(paths.repoConfig, "utf8")).toBe(
			"commit:\n  push: false\n  pull: true\n",
		);
	});

	it("rejects a result the schema refuses and leaves the file untouched", async () => {
		writeFileSync(
			paths.repoConfig,
			"roam:\n  clientId: id\n  clientSecret: secret\n",
		);

		const [status, payload] = await post({
			key: "roam.clientId",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(400);
		expect(payload.errors).toEqual([expect.stringContaining("roam")]);
		expect(readFileSync(paths.repoConfig, "utf8")).toBe(
			"roam:\n  clientId: id\n  clientSecret: secret\n",
		);
	});

	it("rejects an unknown key", async () => {
		const [status, payload] = await post({
			key: "bogus.key",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(400);
		expect(payload.error).toContain("Unknown config key");
		expect(readFileSync(paths.repoConfig, "utf8")).toBe(
			"commit:\n  push: false\n  pull: true\n",
		);
	});

	it("rejects a project unset of a global-only key", async () => {
		writeFileSync(paths.repoConfig, "sync:\n  autoConfirm: true\n");

		const [status, payload] = await post({
			key: "sync.autoConfirm",
			cwd: paths.repo,
			scope: "project",
		});

		expect(status).toBe(400);
		expect(payload.error).toContain("global-only");
		expect(readFileSync(paths.repoConfig, "utf8")).toBe(
			"sync:\n  autoConfirm: true\n",
		);
	});

	it("accepts a global unset of a global-only key", async () => {
		writeFileSync(paths.globalConfig, "sync:\n  autoConfirm: true\n");

		const [status, payload] = await post({
			key: "sync.autoConfirm",
			cwd: paths.repo,
			scope: "global",
		});

		expect(status).toBe(200);
		expect(payload.target).toBe("global");
		expect(readYaml(paths.globalConfig)).toEqual({});
	});

	it("rejects a missing key, cwd or scope", async () => {
		const [noKey] = await post({ cwd: paths.repo, scope: "project" });
		expect(noKey).toBe(400);

		const [noCwd] = await post({ key: "commit.push", scope: "project" });
		expect(noCwd).toBe(400);

		const [badScope] = await post({
			key: "commit.push",
			cwd: paths.repo,
			scope: "everywhere",
		});
		expect(badScope).toBe(400);
	});

	it("removes only the key from the shared db override and refreshes the cache", async () => {
		await seedRepoConfigs(orm, {
			[originKey]: { commit: { push: true, pull: true } },
		});

		const [status, payload] = await post({
			key: "commit.push",
			cwd: paths.repo,
			scope: "repo",
		});

		expect(status).toBe(200);
		expect(payload).toEqual({
			target: "repo",
			repoKey: originKey,
			removed: true,
		});
		expect(await listRepoConfigs(orm)).toEqual({
			[originKey]: { commit: { pull: true } },
		});
		expect(readRepoConfigCache()).toEqual({
			[originKey]: { commit: { pull: true } },
		});
		expect(readYaml(paths.globalConfig)).toEqual({ commit: { pull: false } });
		expect(readYaml(paths.repoConfig)).toEqual({
			commit: { push: false, pull: true },
		});
	});

	it("deletes the db override left empty by the removal", async () => {
		await seedRepoConfigs(orm, {
			repo: { commit: { push: true } },
			other: { commit: { push: false } },
		});

		const [status] = await post({
			key: "commit.push",
			cwd: paths.repo,
			scope: "repo",
		});

		expect(status).toBe(200);
		expect(await listRepoConfigs(orm)).toEqual({
			other: { commit: { push: false } },
		});
	});

	it("leaves a yml repos entry alone", async () => {
		writeFileSync(
			paths.globalConfig,
			"repos:\n  repo:\n    commit:\n      push: true\n",
		);

		const [status, payload] = await post({
			key: "commit.push",
			cwd: paths.repo,
			scope: "repo",
		});

		expect(status).toBe(200);
		expect(payload.removed).toBe(false);
		expect(readFileSync(paths.globalConfig, "utf8")).toBe(
			"repos:\n  repo:\n    commit:\n      push: true\n",
		);
	});

	it("reports a key absent from the db override without writing", async () => {
		await seedRepoConfigs(orm, { repo: { commit: { push: true } } });

		const [status, payload] = await post({
			key: "worktree.enabled",
			cwd: paths.repo,
			scope: "repo",
		});

		expect(status).toBe(200);
		expect(payload).toEqual({
			target: "repo",
			repoKey: "repo",
			removed: false,
		});
		expect(await listRepoConfigs(orm)).toEqual({
			repo: { commit: { push: true } },
		});
	});

	it("rejects a repo unset of a global-only key", async () => {
		await seedRepoConfigs(orm, { repo: { commit: { push: true } } });

		const [status, payload] = await post({
			key: "sync.autoConfirm",
			cwd: paths.repo,
			scope: "repo",
		});

		expect(status).toBe(400);
		expect(payload.error).toContain("global-only");
		expect(await listRepoConfigs(orm)).toEqual({
			repo: { commit: { push: true } },
		});
	});
});
