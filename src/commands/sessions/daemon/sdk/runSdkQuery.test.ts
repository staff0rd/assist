import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SdkSessionEvent } from "../../../../shared/harnessAdapters/types";
import { createSdkSessionProcess } from "./createSdkSessionProcess";
import { runSdkQuery } from "./runSdkQuery";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));

function assistant(content: unknown[], parent: string | null = null) {
	return {
		type: "assistant",
		message: { content },
		parent_tool_use_id: parent,
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
	await runSdkQuery(messages, "7", control);
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
		]);
		expect(exits).toEqual([0]);
	});

	it("ignores subagent messages", async () => {
		const { events } = await run(
			stream([assistant([{ type: "tool_use", name: "Read" }], "toolu_1")]),
		);
		expect(events).toEqual([]);
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
		await runSdkQuery(aborted(), "7", control);
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
