import { describe, expect, it } from "vitest";
import { groupToolRuns } from "./groupToolRuns";

const tool = (target: string) => ({
	role: "tool" as const,
	tool: "Bash",
	target,
});

describe("groupToolRuns", () => {
	it("folds consecutive tool calls between messages into one run", () => {
		const items = groupToolRuns([
			{ role: "user", text: "hi" },
			tool("ls"),
			tool("pwd"),
			{ role: "assistant", text: "done" },
			tool("ls"),
		]);
		expect(items.map((i) => i.kind)).toEqual([
			"message",
			"tools",
			"message",
			"tools",
		]);
		const [, run, , single] = items;
		expect(run.kind === "tools" && run.calls.map((c) => c.target)).toEqual([
			"ls",
			"pwd",
		]);
		expect(single.kind === "tools" && single.calls).toHaveLength(1);
	});

	it("keeps a run's key stable as more calls are appended", () => {
		const before = groupToolRuns([{ role: "user", text: "hi" }, tool("ls")]);
		const after = groupToolRuns([
			{ role: "user", text: "hi" },
			tool("ls"),
			tool("pwd"),
		]);
		expect(after[1]).toMatchObject({
			key: before[1].kind === "tools" && before[1].key,
		});
	});

	it("gives repeated calls distinct keys", () => {
		const [run] = groupToolRuns([tool("ls"), tool("ls")]);
		expect(run.kind === "tools" && run.calls.map((c) => c.key)).toEqual([
			"tool:Bash:ls#0",
			"tool:Bash:ls#1",
		]);
	});
});
