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
import { listRepoConfigs } from "../../shared/db/listRepoConfigs";
import { readUserConfig } from "../../shared/db/readUserConfig";
import type { PreviewRequest } from "../sessions/shared/requestPreviewDecision";
import { rulesAdd } from "./rulesAdd";
import type { UserRuleOptions } from "./userRuleOptionsError";

let orm: Db;

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
}));

vi.mock("../backlog/getCurrentOrigin", () => ({
	getCurrentOrigin: () => "github.com/org/assist",
}));

const requestPreviewDecision = vi.hoisted(() => vi.fn());
vi.mock("../sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision,
}));

type Target = {
	name: string;
	options: (root: string) => UserRuleOptions;
	lands: string;
	written: () => Promise<unknown>;
	expected: unknown;
};

let root: string;
let globalConfigPath: string;

const targets: Target[] = [
	{
		name: "CLAUDE.md (--scope)",
		options: (r) => ({ title: "Links", scope: r }),
		lands: "`CLAUDE.md` as **R2**",
		written: async () => readFileSync(join(root, "CLAUDE.md"), "utf8"),
		expected:
			"## Rules\n\n- **R1** — Root rule\n- **R2** — **Links** — Give the direct URL\n",
	},
	{
		name: "user (db) (--user)",
		options: () => ({ title: "Links", user: true }),
		lands: "`advice.rules` in user (db)",
		written: async () => (await readUserConfig(orm)).advice ?? null,
		expected: { rules: [{ title: "Links", text: "Give the direct URL" }] },
	},
	{
		name: "user (node) (--node)",
		options: () => ({ title: "Links", node: true }),
		lands: "`advice.rules` in user (node)",
		written: async () => {
			try {
				return parseYaml(readFileSync(globalConfigPath, "utf8")).advice;
			} catch {
				return null;
			}
		},
		expected: { rules: [{ title: "Links", text: "Give the direct URL" }] },
	},
	{
		name: "repo (db) (--repo)",
		options: () => ({ title: "Links", repo: true }),
		lands: "`advice.rules` in repo (db): `github.com/org/assist`",
		written: async () =>
			(await listRepoConfigs(orm))["github.com/org/assist"]?.advice ?? null,
		expected: { rules: [{ title: "Links", text: "Give the direct URL" }] },
	},
];

const NOTHING = [null, "## Rules\n\n- **R1** — Root rule\n"];

describe("rulesAdd", () => {
	let errors: string[];
	let logs: string[];

	beforeEach(async () => {
		({ orm } = await createTestDb());
		root = mkdtempSync(join(tmpdir(), "rules-add-"));
		mkdirSync(join(root, ".git"));
		writeFileSync(
			join(root, "CLAUDE.md"),
			"## Rules\n\n- **R1** — Root rule\n",
		);
		globalConfigPath = join(root, ".assist.yml");
		vi.spyOn(process, "cwd").mockReturnValue(root);
		errors = [];
		logs = [];
		vi.spyOn(console, "error").mockImplementation((...a) => {
			errors.push(a.join(" "));
		});
		vi.spyOn(console, "log").mockImplementation((...a) => {
			logs.push(a.join(" "));
		});
		vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
			throw new Error(`exit ${code}`);
		}) as never);
		vi.stubEnv("ASSIST_SESSION", "1");
		vi.stubEnv("ASSIST_SESSION_ID", "s1");
		requestPreviewDecision.mockReset();
	});

	afterEach(() => {
		rmSync(root, { recursive: true, force: true });
		process.exitCode = undefined;
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
	});

	const add = (target: Target) =>
		rulesAdd(
			"Give the direct URL",
			target.options(root),
			globalConfigPath,
			root,
		);

	describe.each(targets)("$name", (target) => {
		it("previews the title, text and target, then writes on approval", async () => {
			let writtenBeforeDecision: unknown;
			requestPreviewDecision.mockImplementation(async () => {
				writtenBeforeDecision = await target.written();
				return { decision: "approve" };
			});

			await add(target);

			expect(NOTHING).toContainEqual(writtenBeforeDecision);
			const request: PreviewRequest = requestPreviewDecision.mock.calls[0][0];
			expect(request.kind).toBe("rule");
			expect(request.body).toContain("**Title:** Links");
			expect(request.body).toContain("**Rule:** Give the direct URL");
			expect(request.body).toContain(`**Lands in:** ${target.lands}`);
			expect(await target.written()).toEqual(target.expected);
			expect(logs.join("\n")).toContain("Added");
		});

		it("writes nothing and exits non-zero with the reason and comments on rejection", async () => {
			requestPreviewDecision.mockResolvedValue({
				decision: "reject",
				reason: "Too vague",
				comments: [{ quote: "direct URL", note: "say deep link" }],
			});

			await expect(add(target)).rejects.toThrow("exit 1");

			expect(NOTHING).toContainEqual(await target.written());
			const output = errors.join("\n");
			expect(output).toContain("Rule rejected: Too vague");
			expect(output).toContain("say deep link");
		});

		it("writes without a preview outside a web session", async () => {
			vi.stubEnv("ASSIST_SESSION", "");

			await add(target);

			expect(requestPreviewDecision).not.toHaveBeenCalled();
			expect(await target.written()).toEqual(target.expected);
		});
	});

	it("rejects invalid options before opening a preview", async () => {
		await rulesAdd(
			"Give the direct URL",
			{ user: true },
			globalConfigPath,
			root,
		);

		expect(requestPreviewDecision).not.toHaveBeenCalled();
		expect(process.exitCode).toBe(1);
	});
});
