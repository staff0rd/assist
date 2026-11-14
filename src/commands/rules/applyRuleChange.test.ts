import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parse as parseYaml } from "yaml";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { readUserConfig } from "../../shared/db/readUserConfig";
import { updateUserConfig } from "../../shared/db/updateUserConfig";
import { applyRuleChange } from "./applyRuleChange";

let orm: Db;

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
}));

vi.mock("../backlog/getCurrentOrigin", () => ({
	getCurrentOrigin: () => "github.com/org/assist",
}));

const ROOT_MD = [
	"# Repo",
	"",
	"## Rules",
	"",
	"- **R1** — **Be terse** — Say less.",
	"- **R2** — Keep it simple.",
	"",
	"Directories with their own `## Rules`: `docs/`",
	"",
	"## Other",
	"",
	"Text.",
	"",
].join("\n");

const DOCS_MD =
	"## Rules\n\n- **R3** — **No internals** — Describe behaviour.\n";

describe("applyRuleChange", () => {
	let root: string;
	let globalConfigPath: string;

	const read = (file: string) => readFileSync(join(root, file), "utf8");

	beforeEach(async () => {
		({ orm } = await createTestDb());
		root = mkdtempSync(join(tmpdir(), "apply-rule-change-"));
		mkdirSync(join(root, ".git"));
		mkdirSync(join(root, "docs"));
		writeFileSync(join(root, "CLAUDE.md"), ROOT_MD);
		writeFileSync(join(root, "docs", "CLAUDE.md"), DOCS_MD);
		globalConfigPath = join(root, ".assist.yml");
		await updateUserConfig(orm, () => ({
			ok: true,
			config: { advice: { rules: [{ title: "Links", text: "Give the URL" }] } },
			result: undefined,
		}));
	});

	afterEach(() => {
		rmSync(root, { recursive: true, force: true });
		vi.restoreAllMocks();
	});

	it("edits a CLAUDE.md rule in place, keeping its code", async () => {
		const result = await applyRuleChange(
			{
				kind: "edit",
				scopeId: "claude-md:",
				rule: { code: "R1", title: "Be terse", text: "Say less." },
				to: "claude-md:",
				title: "Be brief",
				text: "Say even less.",
			},
			root,
			globalConfigPath,
		);

		expect(result).toEqual({ ok: true, code: undefined });
		expect(read("CLAUDE.md")).toBe(
			ROOT_MD.replace(
				"- **R1** — **Be terse** — Say less.",
				"- **R1** — **Be brief** — Say even less.",
			),
		);
	});

	it("edits an advice.rules entry in user (db)", async () => {
		await applyRuleChange(
			{
				kind: "edit",
				scopeId: "user-db",
				rule: { title: "Links", text: "Give the URL" },
				to: "user-db",
				title: "Links",
				text: "Give the direct URL",
			},
			root,
			globalConfigPath,
		);

		expect(await readUserConfig(orm)).toEqual({
			advice: { rules: [{ title: "Links", text: "Give the direct URL" }] },
		});
	});

	it("moves a user (db) rule into a nested CLAUDE.md with the next code", async () => {
		const result = await applyRuleChange(
			{
				kind: "edit",
				scopeId: "user-db",
				rule: { title: "Links", text: "Give the URL" },
				to: "claude-md:docs/",
				title: "Links",
				text: "Give the URL",
			},
			root,
			globalConfigPath,
		);

		expect(result).toEqual({ ok: true, code: "R4" });
		expect(read("docs/CLAUDE.md")).toBe(
			`${DOCS_MD}- **R4** — **Links** — Give the URL\n`,
		);
		expect(await readUserConfig(orm)).toEqual({ advice: { rules: [] } });
	});

	it("moves a CLAUDE.md rule into user (node), dropping its code and refreshing the index", async () => {
		await applyRuleChange(
			{
				kind: "edit",
				scopeId: "claude-md:docs/",
				rule: {
					code: "R3",
					title: "No internals",
					text: "Describe behaviour.",
				},
				to: "user-node",
				title: "No internals",
				text: "Describe behaviour.",
			},
			root,
			globalConfigPath,
		);

		expect(parseYaml(readFileSync(globalConfigPath, "utf8"))).toEqual({
			advice: {
				rules: [{ title: "No internals", text: "Describe behaviour." }],
			},
		});
		expect(read("docs/CLAUDE.md")).toBe("## Rules\n");
		expect(read("CLAUDE.md")).not.toContain("Directories with their own");
	});

	it("deletes a CLAUDE.md rule", async () => {
		await applyRuleChange(
			{
				kind: "delete",
				scopeId: "claude-md:",
				rule: { code: "R2", text: "Keep it simple." },
			},
			root,
			globalConfigPath,
		);

		expect(read("CLAUDE.md")).toBe(
			ROOT_MD.replace("- **R2** — Keep it simple.\n", ""),
		);
	});

	it("refuses a rule that changed since it was shown, writing nothing", async () => {
		const result = await applyRuleChange(
			{
				kind: "delete",
				scopeId: "claude-md:",
				rule: { code: "R2", text: "Something else." },
			},
			root,
			globalConfigPath,
		);

		expect(result.ok).toBe(false);
		expect(read("CLAUDE.md")).toBe(ROOT_MD);
	});

	it("refuses a move into advice.rules without a title", async () => {
		const result = await applyRuleChange(
			{
				kind: "edit",
				scopeId: "claude-md:",
				rule: { code: "R2", text: "Keep it simple." },
				to: "user-db",
				text: "Keep it simple.",
			},
			root,
			globalConfigPath,
		);

		expect(result).toEqual({
			ok: false,
			error: "Rules in User (db) need a title",
		});
		expect(read("CLAUDE.md")).toBe(ROOT_MD);
	});
});
