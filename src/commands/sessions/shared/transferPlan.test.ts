import { describe, expect, it } from "vitest";
import { transferPlan } from "./transferPlan";

describe("transferPlan", () => {
	it("plans a backlog run by its args", () => {
		expect(
			transferPlan({
				commandType: "assist",
				assistArgs: ["backlog", "run", "a1402"],
			}),
		).toEqual({ kind: "backlog-run", args: ["backlog", "run", "a1402"] });
	});

	it("plans a Claude prompt session by its conversation id", () => {
		expect(
			transferPlan({ commandType: "claude", claudeSessionId: "c-1" }),
		).toEqual({ kind: "prompt", conversationId: "c-1" });
		expect(
			transferPlan({
				commandType: "claude",
				harness: "claude",
				claudeSessionId: "c-1",
			}),
		).toEqual({ kind: "prompt", conversationId: "c-1" });
	});

	const refused: [string, Parameters<typeof transferPlan>[0]][] = [
		["other assist commands", { commandType: "assist", assistArgs: ["draft"] }],
		["runs", { commandType: "run" }],
		["prompt sessions with no conversation", { commandType: "claude" }],
		[
			"other harnesses",
			{ commandType: "claude", harness: "pi", claudeSessionId: "c-1" },
		],
	];

	it.each(refused)("refuses %s", (_label, session) => {
		expect(transferPlan(session)).toBeUndefined();
	});
});
