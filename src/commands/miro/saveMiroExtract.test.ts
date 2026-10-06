import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { parse, stringify } from "yaml";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { listRepoConfigs } from "../../shared/db/listRepoConfigs";
import type { MiroExtractConfig } from "../../shared/types";
import { seedRepoConfigs } from "../../test/mothers/seedRepoConfigs";
import { saveMiroExtract } from "./saveMiroExtract";
import type { MiroExtractOptions } from "./types";

let orm: Db;

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
}));

vi.mock("../backlog/getCurrentOrigin", () => ({
	getCurrentOrigin: () => "github.com/org/assist",
}));

let dir: string;
let globalConfigPath: string;

const epics: MiroExtractConfig = {
	board: "uXjVGqQsR5Q=",
	frame: "3458764665701555761",
	topLeft: "3458764680658544387",
	bottomRight: "3458764680658544425",
	items: "board-items.json",
	out: "epics.yml",
};

function projectConfigPath(): string {
	return join(dir, "assist.yml");
}

function read(path: string): Record<string, unknown> {
	return parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

function save(options: MiroExtractOptions, name = "epics") {
	return saveMiroExtract(name, epics, options, { cwd: dir, globalConfigPath });
}

beforeEach(async () => {
	({ orm } = await createTestDb());
	dir = mkdtempSync(join(tmpdir(), "miro-save-"));
	globalConfigPath = join(dir, "global.yml");
	writeFileSync(globalConfigPath, stringify({}));
	writeFileSync(projectConfigPath(), stringify({}));
});

describe("saveMiroExtract", () => {
	describe("with no scope flags", () => {
		it("should write the project config and report its path", async () => {
			expect(await save({})).toBe(projectConfigPath());
			expect(read(projectConfigPath())).toEqual({
				miro: { extracts: { epics } },
			});
		});

		it("should leave the global config alone", async () => {
			await save({});

			expect(read(globalConfigPath)).toEqual({});
		});

		it("should keep extracts already saved", async () => {
			writeFileSync(
				projectConfigPath(),
				stringify({ miro: { extracts: { risks: epics } } }),
			);

			await save({});

			expect(Object.keys(read(projectConfigPath()).miro as object)).toEqual([
				"extracts",
			]);
			expect(
				Object.keys(
					(read(projectConfigPath()).miro as { extracts: object }).extracts,
				),
			).toEqual(["risks", "epics"]);
		});
	});

	describe("with --global", () => {
		it("should write the global config and report its path", async () => {
			expect(await save({ global: true })).toBe(globalConfigPath);
			expect(read(globalConfigPath)).toEqual({ miro: { extracts: { epics } } });
			expect(read(projectConfigPath())).toEqual({});
		});
	});

	describe("with --global --repo", () => {
		it("should write the current repo's shared db override", async () => {
			const path = await save({ global: true, repo: true });

			expect(path).toBe("the shared db under repos.github.com/org/assist");
			expect(await listRepoConfigs(orm)).toEqual({
				"github.com/org/assist": { miro: { extracts: { epics } } },
			});
			expect(read(globalConfigPath)).toEqual({});
			expect(read(projectConfigPath())).toEqual({});
		});
	});

	describe("with --global --repo <name>", () => {
		it("should write under that repo's shared db key", async () => {
			await seedRepoConfigs(orm, {
				"github.com/org/other": { worktree: { enabled: true } },
			});

			const path = await save({ global: true, repo: "github.com/org/other" });

			expect(path).toBe("the shared db under repos.github.com/org/other");
			expect(await listRepoConfigs(orm)).toEqual({
				"github.com/org/other": {
					worktree: { enabled: true },
					miro: { extracts: { epics } },
				},
			});
		});
	});

	describe("with --repo but no --global", () => {
		it("should refuse, naming the flag to add", async () => {
			await expect(save({ repo: true })).rejects.toThrow(
				/--repo writes to the global config; add -g/,
			);
		});
	});
});
