import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const globalConfigPath = vi.hoisted(() => ({ path: "" }));

const mockRespondJson = vi.fn();

vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

vi.mock("../../../shared/loadConfigFrom", async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return { ...actual, getGlobalConfigPath: () => globalConfigPath.path };
});

import { readConfigEntries } from "../../config/readConfigEntries";
import { setConfig } from "./setConfig";
import { configArrayItems } from "./ui/App/ConfigView/ConfigRowValueCell/ConfigArrayRow/useConfigArrayRowEditor/configArrayItems";
import { configArrayLayerItems } from "./ui/App/ConfigView/ConfigRowValueCell/ConfigArrayRow/useConfigArrayRowEditor/configArrayLayerItems";
import { placeConfigArrayItem } from "./ui/App/ConfigView/ConfigRowValueCell/ConfigArrayRow/useConfigArrayRowEditor/useConfigArrayItemWrites/placeConfigArrayItem";

const root = join(tmpdir(), "assist-set-config-array-scopes-test");
const home = join(root, "home");
const repo = join(root, "repo");
const repoConfig = join(repo, "assist.yml");
const globalConfig = join(home, ".assist.yml");
const originKey = `local:${repo}`;
globalConfigPath.path = globalConfig;

mkdirSync(repo, { recursive: true });
mkdirSync(home, { recursive: true });

const projectConfig = {
	run: [
		{ name: "build", command: "npm run build" },
		{ name: "test", command: "vitest" },
	],
	deny: [{ pattern: "rm -rf", message: "no" }],
	subtasks: [{ title: "write tests" }],
};

afterAll(() => {
	vi.unstubAllEnvs();
	rmSync(root, { recursive: true, force: true });
});

async function post(body: unknown): Promise<number> {
	const req = Readable.from([
		Buffer.from(JSON.stringify(body)),
	]) as unknown as IncomingMessage;
	await setConfig(req, {} as ServerResponse);
	const [, status] = mockRespondJson.mock.lastCall as [
		ServerResponse,
		number,
		Record<string, unknown>,
	];
	return status;
}

function readYaml(path: string): Record<string, unknown> {
	return parseYaml(readFileSync(path, "utf8")) as Record<string, unknown>;
}

function entryFor(key: string) {
	const entry = readConfigEntries(repo).find((leaf) => leaf.key === key);
	if (!entry) throw new Error(`no entry for ${key}`);
	return entry;
}

async function postItemSaveAsTheArrayEditorWould(
	key: string,
	scope: "project" | "repo" | "global",
	itemIndex: number | undefined,
	value: unknown,
): Promise<number> {
	const entry = entryFor(key);
	const owner =
		itemIndex === undefined
			? undefined
			: configArrayItems(entry)[itemIndex]?.owner;
	const replaceAt =
		owner && owner.scope === scope ? owner.indexInScope : undefined;
	return post({
		key,
		value: placeConfigArrayItem(
			configArrayLayerItems(entry, scope),
			replaceAt,
			value,
		),
		cwd: repo,
		scope,
	});
}

describe("array config writes at a chosen scope", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubEnv("HOME", home);
		writeFileSync(repoConfig, stringifyYaml(projectConfig));
		writeFileSync(
			globalConfig,
			stringifyYaml({
				repos: { [originKey]: { worktree: { enabled: true } } },
			}),
		);
	});

	it("adds one run command to the repo override and leaves the project file alone", async () => {
		const status = await postItemSaveAsTheArrayEditorWould(
			"run",
			"repo",
			undefined,
			{ name: "deploy", command: "./deploy" },
		);

		expect(status).toBe(200);
		expect(readYaml(globalConfig)).toEqual({
			repos: {
				[originKey]: {
					worktree: { enabled: true },
					run: [{ name: "deploy", command: "./deploy" }],
				},
			},
		});
		expect(readYaml(repoConfig)).toEqual(projectConfig);
	});

	it("adds one deny rule to the repo override and leaves the project file alone", async () => {
		const status = await postItemSaveAsTheArrayEditorWould(
			"deny",
			"repo",
			undefined,
			{ pattern: "curl", message: "ask first" },
		);

		expect(status).toBe(200);
		expect(readYaml(globalConfig)).toEqual({
			repos: {
				[originKey]: {
					worktree: { enabled: true },
					deny: [{ pattern: "curl", message: "ask first" }],
				},
			},
		});
		expect(readYaml(repoConfig)).toEqual(projectConfig);
	});

	it("adds one subtask to the repo override and leaves the project file alone", async () => {
		const status = await postItemSaveAsTheArrayEditorWould(
			"subtasks",
			"repo",
			undefined,
			{ title: "update docs" },
		);

		expect(status).toBe(200);
		expect(readYaml(globalConfig)).toEqual({
			repos: {
				[originKey]: {
					worktree: { enabled: true },
					subtasks: [{ title: "update docs" }],
				},
			},
		});
		expect(readYaml(repoConfig)).toEqual(projectConfig);
	});

	it("adds to the repo override without copying the entries already there", async () => {
		await postItemSaveAsTheArrayEditorWould("run", "repo", undefined, {
			name: "deploy",
			command: "./deploy",
		});
		await postItemSaveAsTheArrayEditorWould("run", "repo", undefined, {
			name: "smoke",
			command: "./smoke",
		});

		expect(readYaml(globalConfig)).toMatchObject({
			repos: {
				[originKey]: {
					run: [
						{ name: "deploy", command: "./deploy" },
						{ name: "smoke", command: "./smoke" },
					],
				},
			},
		});
		expect(readYaml(repoConfig)).toEqual(projectConfig);
	});

	it("edits a project-owned run command in the project file only", async () => {
		const status = await postItemSaveAsTheArrayEditorWould(
			"run",
			"project",
			1,
			{
				name: "test",
				command: "vitest run",
			},
		);

		expect(status).toBe(200);
		expect(readYaml(repoConfig)).toEqual({
			...projectConfig,
			run: [
				{ name: "build", command: "npm run build" },
				{ name: "test", command: "vitest run" },
			],
		});
		expect(readYaml(globalConfig)).toEqual({
			repos: { [originKey]: { worktree: { enabled: true } } },
		});
	});

	it("edits a repo-owned run command without touching the project's commands", async () => {
		writeFileSync(
			globalConfig,
			stringifyYaml({
				repos: {
					[originKey]: { run: [{ name: "deploy", command: "./deploy" }] },
				},
			}),
		);

		const status = await postItemSaveAsTheArrayEditorWould("run", "repo", 0, {
			name: "deploy",
			command: "./deploy --prod",
		});

		expect(status).toBe(200);
		expect(readYaml(globalConfig)).toEqual({
			repos: {
				[originKey]: { run: [{ name: "deploy", command: "./deploy --prod" }] },
			},
		});
		expect(readYaml(repoConfig)).toEqual(projectConfig);
	});
});
