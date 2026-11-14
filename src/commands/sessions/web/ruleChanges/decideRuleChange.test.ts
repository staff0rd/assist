import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { RuleChange } from "../../../rules/types";
import { decideRuleChange } from "./decideRuleChange";
import { listRuleChanges } from "./listRuleChanges";
import { pendingRuleChanges } from "./pendingRuleChanges";
import { proposeRuleChange } from "./proposeRuleChange";

const CLAUDE_MD = "## Rules\n\n- **R1** — **Be terse** — Say less.\n";

const edit: RuleChange = {
	kind: "edit",
	scopeId: "claude-md:",
	rule: { code: "R1", title: "Be terse", text: "Say less." },
	to: "claude-md:",
	title: "Be terse",
	text: "Say nothing.",
};

describe("rule change approval", () => {
	let root: string;
	let globalConfigPath: string;
	const read = () => readFileSync(join(root, "CLAUDE.md"), "utf8");

	beforeEach(() => {
		root = mkdtempSync(join(tmpdir(), "decide-rule-change-"));
		mkdirSync(join(root, ".git"));
		writeFileSync(join(root, "CLAUDE.md"), CLAUDE_MD);
		globalConfigPath = join(root, ".assist.yml");
	});

	afterEach(() => {
		pendingRuleChanges.clear();
		rmSync(root, { recursive: true, force: true });
	});

	async function propose(change: RuleChange = edit) {
		const result = await proposeRuleChange(change, root, globalConfigPath);
		if (!result.ok) throw new Error(result.error);
		return result.pending;
	}

	it("writes nothing while the change awaits approval", async () => {
		const pending = await propose();

		expect(read()).toBe(CLAUDE_MD);
		expect(listRuleChanges(root)).toEqual([pending]);
	});

	it("applies exactly the change on approval", async () => {
		const pending = await propose();

		expect(
			await decideRuleChange(pending.id, "approve", globalConfigPath),
		).toEqual({
			ok: true,
			code: undefined,
		});
		expect(read()).toBe("## Rules\n\n- **R1** — **Be terse** — Say nothing.\n");
		expect(listRuleChanges(root)).toEqual([]);
	});

	it("writes nothing on rejection", async () => {
		const pending = await propose({
			kind: "delete",
			scopeId: "claude-md:",
			rule: edit.rule,
		});

		expect(
			await decideRuleChange(pending.id, "reject", globalConfigPath),
		).toEqual({
			ok: true,
		});
		expect(read()).toBe(CLAUDE_MD);
		expect(listRuleChanges(root)).toEqual([]);
	});

	it("refuses a second change to a rule already awaiting approval", async () => {
		await propose();

		const second = await proposeRuleChange(
			{ kind: "delete", scopeId: "claude-md:", rule: edit.rule },
			root,
			globalConfigPath,
		);

		expect(second).toEqual({
			ok: false,
			error: "That rule already has a change awaiting approval",
		});
	});

	it("previews the code a move into a CLAUDE.md will get", async () => {
		mkdirSync(join(root, "docs"));
		writeFileSync(join(root, "docs", "CLAUDE.md"), "## Rules\n");

		const pending = await propose({
			...edit,
			to: "claude-md:docs/",
			text: "Say less.",
		});

		expect(pending.code).toBe("R2");
	});
});
