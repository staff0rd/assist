import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import type { ProposedItem } from "./proposedItemSchema";
import { reviewProposal } from "./reviewProposal";

vi.mock("../../sessions/shared/awaitPreviewApproval", () => ({
	awaitPreviewApproval: vi.fn(),
}));

const item: ProposedItem = {
	type: "bug",
	name: "Thing breaks",
	description: "It breaks.",
	acceptanceCriteria: ["It works"],
	phases: [],
};

const AGENT_ENV = ["CLAUDECODE", "CODEX_TOOL_CALL_ID", "CODEX_THREAD_ID"];

describe("reviewProposal without a session id", () => {
	let logSpy: MockInstance<typeof console.log>;
	const saved: Record<string, string | undefined> = {};

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		for (const key of AGENT_ENV) {
			saved[key] = process.env[key];
			delete process.env[key];
		}
	});

	afterEach(() => {
		logSpy.mockRestore();
		for (const key of AGENT_ENV) {
			if (saved[key] === undefined) delete process.env[key];
			else process.env[key] = saved[key];
		}
	});

	const output = () => logSpy.mock.calls.map((c) => c.join(" ")).join("\n");

	it("lets a human at a terminal create the item", async () => {
		expect(await reviewProposal(item, undefined, false)).toEqual({
			autostart: false,
		});
	});

	it("drafts only for a Codex agent without --confirmed", async () => {
		process.env.CODEX_TOOL_CALL_ID = "exec-1";

		expect(await reviewProposal(item, undefined, false)).toBeNull();
		expect(output()).toContain("Draft only");
	});

	it("creates for a Codex agent with --confirmed", async () => {
		process.env.CODEX_TOOL_CALL_ID = "exec-1";

		expect(await reviewProposal(item, undefined, true)).toEqual({
			autostart: false,
		});
	});

	it("drafts only for Claude Code without --confirmed", async () => {
		process.env.CLAUDECODE = "1";

		expect(await reviewProposal(item, undefined, false)).toBeNull();
	});
});
