import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadConfigFrom } from "./loadConfigFrom";
import { resolveCodexModel } from "./resolveCodexModel";
import { writeRepoConfigCache } from "./writeRepoConfigCache";

describe("resolveCodexModel", () => {
	it("keeps a named model", () => {
		expect(resolveCodexModel(" gpt-5-codex ")).toBe("gpt-5-codex");
	});

	it.each([
		["codex-default", "codex-default"],
		["empty", ""],
		["whitespace", "  "],
		["unset", undefined],
	])("maps %s to no model", (_name, value) => {
		expect(resolveCodexModel(value)).toBeUndefined();
	});
});

describe("a repo's codex-default over a user codexModel", () => {
	let base: string;
	let repo: string;

	beforeEach(() => {
		base = mkdtempSync(join(tmpdir(), "codex-default-"));
		repo = mkdtempSync(join(base, "repo-"));
	});

	afterEach(() => {
		writeRepoConfigCache({});
		rmSync(base, { recursive: true, force: true });
	});

	it("resolves both codexModel keys to no model", () => {
		writeRepoConfigCache(
			{},
			{
				review: { codexModel: "gpt-5-codex" },
				harness: { codexModel: "gpt-5-codex" },
			},
		);
		const global = join(base, "assist.yml");
		writeFileSync(global, "");
		writeFileSync(
			join(repo, "assist.yml"),
			"review:\n  codexModel: codex-default\nharness:\n  codexModel: codex-default\n",
		);

		const config = loadConfigFrom(repo, global);

		expect(config.review?.codexModel).toBe("codex-default");
		expect(resolveCodexModel(config.review?.codexModel)).toBeUndefined();
		expect(resolveCodexModel(config.harness.codexModel)).toBeUndefined();
	});
});
