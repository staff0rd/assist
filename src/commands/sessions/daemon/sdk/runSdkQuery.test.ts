import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SdkSessionEvent } from "../../../../shared/harnessAdapters/types";
import { createSdkSessionProcess } from "./createSdkSessionProcess";
import { createSdkTurnTracker } from "./createSdkTurnTracker";
import { runSdkQuery } from "./runSdkQuery";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));

function assistant(content: unknown[], parent: string | null = null) {
	return {
		type: "assistant",
		message: { content },
		parent_tool_use_id: parent,
	} as unknown as SDKMessage;
}

function progress(seconds: number, parent: string | null = null) {
	return {
		type: "tool_progress",
		tool_use_id: "toolu_9",
		tool_name: "Bash",
		parent_tool_use_id: parent,
		elapsed_time_seconds: seconds,
	} as unknown as SDKMessage;
}

const result = { type: "result", subtype: "success" } as unknown as SDKMessage;

async function* stream(messages: SDKMessage[]) {
	yield* messages;
}

async function run(messages: AsyncIterable<SDKMessage>) {
	const control = createSdkSessionProcess("7", new AbortController());
	const events: SdkSessionEvent[] = [];
	const exits: number[] = [];
	control.process.sdk?.onEvent((event) => events.push(event));
	control.process.onExit(({ exitCode }) => exits.push(exitCode));
	await runSdkQuery(
		messages,
		"7",
		control,
		createSdkTurnTracker("session 7", control, vi.fn()),
	);
	return { events, exits };
}

describe("runSdkQuery", () => {
	beforeEach(() => vi.clearAllMocks());

	it("moves to running with the current activity, then waiting with it cleared", async () => {
		const { events, exits } = await run(
			stream([
				assistant([
					{ type: "tool_use", name: "Bash", input: { command: "npm test" } },
				]),
				assistant([{ type: "text" }]),
				result,
			]),
		);
		expect(events).toEqual([
			{ kind: "status", status: "running" },
			{ kind: "activity", text: "Working · Bash npm test" },
			{ kind: "activity", text: "Working" },
			{ kind: "activity", text: null },
			{ kind: "status", status: "waiting" },
			{ kind: "pending", texts: [] },
		]);
		expect(exits).toEqual([0]);
	});

	it("emits the top-level tool call's elapsed seconds, resyncing every 10s and clearing with the activity", async () => {
		const { events } = await run(
			stream([
				assistant([
					{ type: "tool_use", name: "Bash", input: { command: "npm i" } },
				]),
				progress(1.4),
				progress(2.2),
				progress(30, "toolu_1"),
				progress(11.6),
				assistant([{ type: "text" }]),
				result,
			]),
		);
		expect(events).toEqual([
			{ kind: "status", status: "running" },
			{ kind: "activity", text: "Working · Bash npm i" },
			{ kind: "elapsed", seconds: 1 },
			{ kind: "elapsed", seconds: 11 },
			{ kind: "activity", text: "Working" },
			{ kind: "elapsed", seconds: null },
			{ kind: "activity", text: null },
			{ kind: "status", status: "waiting" },
			{ kind: "pending", texts: [] },
		]);
	});

	it("emits the prompt suggestion that follows the result", async () => {
		const { events } = await run(
			stream([
				result,
				{
					type: "prompt_suggestion",
					suggestion: "commit this",
				} as unknown as SDKMessage,
			]),
		);
		expect(events).toContainEqual({ kind: "suggestion", text: "commit this" });
	});

	it("ignores subagent messages", async () => {
		const { events } = await run(
			stream([assistant([{ type: "tool_use", name: "Read" }], "toolu_1")]),
		);
		expect(events).toEqual([{ kind: "pending", texts: [] }]);
	});

	it("exits cleanly when a kill aborts the query", async () => {
		const abort = new AbortController();
		const control = createSdkSessionProcess("7", abort);
		const exits: number[] = [];
		control.process.onExit(({ exitCode }) => exits.push(exitCode));
		async function* aborted(): AsyncGenerator<SDKMessage> {
			yield* [];
			abort.abort();
			throw new Error("Operation aborted");
		}
		await runSdkQuery(
			aborted(),
			"7",
			control,
			createSdkTurnTracker("session 7", control, vi.fn()),
		);
		expect(exits).toEqual([0]);
	});

	it("exits non-zero when the query throws", async () => {
		async function* failing(): AsyncGenerator<SDKMessage> {
			yield* [];
			throw new Error("claude exited");
		}
		const { exits } = await run(failing());
		expect(exits).toEqual([1]);
	});
});
