import type { ThreadEvent } from "@openai/codex-sdk";
import { describe, expect, it, vi } from "vitest";
import { createSdkInput } from "../createSdkInput";
import type { DrivenTurnEvent } from "../DrivenTurnEvent";
import { codexTurnEvents } from "./codexTurnEvents";

vi.mock("../../daemonLog", () => ({ daemonLog: vi.fn() }));

const command: ThreadEvent = {
	type: "item.started",
	item: {
		id: "1",
		type: "command_execution",
		command: "ls",
		aggregated_output: "",
		status: "in_progress",
	},
};
const completed: ThreadEvent = {
	type: "turn.completed",
	usage: {
		input_tokens: 1,
		cached_input_tokens: 0,
		cache_write_input_tokens: 0,
		output_tokens: 1,
		reasoning_output_tokens: 0,
	},
};

async function* stream(events: ThreadEvent[]) {
	for (const event of events) yield event;
}

async function* untilAborted(signal: AbortSignal, started: () => void) {
	yield command;
	started();
	await new Promise((_, reject) =>
		signal.addEventListener("abort", () => reject(new Error("aborted"))),
	);
}

async function collect(
	events: AsyncIterable<DrivenTurnEvent>,
): Promise<DrivenTurnEvent[]> {
	const seen: DrivenTurnEvent[] = [];
	for await (const event of events) seen.push(event);
	return seen;
}

describe("codexTurnEvents", () => {
	it("runs each input message as a turn bracketed by running and waiting", async () => {
		const input = createSdkInput();
		const runTurn = vi.fn(async (_text: string, _signal: AbortSignal) =>
			stream([command, completed]),
		);
		const turns = codexTurnEvents(input.messages, runTurn, "session s");
		input.push("first");
		input.push("second");
		input.close();
		expect(await collect(turns.events)).toEqual([
			{ kind: "status", status: "running" },
			{ kind: "activity", text: "Working · Shell" },
			{ kind: "status", status: "waiting" },
			{ kind: "status", status: "running" },
			{ kind: "activity", text: "Working · Shell" },
			{ kind: "status", status: "waiting" },
		]);
		expect(runTurn.mock.calls.map(([text]) => text)).toEqual([
			"first",
			"second",
		]);
	});

	it("aborts the running turn on interrupt and waits for the next message", async () => {
		const input = createSdkInput();
		let started: () => void = () => {};
		const running = new Promise<void>((resolve) => {
			started = resolve;
		});
		const turns = codexTurnEvents(
			input.messages,
			async (_text, signal) => untilAborted(signal, started),
			"session s",
		);
		input.push("long");
		const seen = collect(turns.events);
		await running;
		await turns.interrupt();
		input.close();
		expect(await seen).toEqual([
			{ kind: "status", status: "running" },
			{ kind: "activity", text: "Working · Shell" },
			{ kind: "status", status: "waiting" },
		]);
	});

	it("keeps the session alive when a turn fails", async () => {
		const input = createSdkInput();
		const turns = codexTurnEvents(
			input.messages,
			async () => {
				throw new Error("Codex Exec exited with code 1");
			},
			"session s",
		);
		input.push("boom");
		input.close();
		expect(await collect(turns.events)).toEqual([
			{ kind: "status", status: "running" },
			{ kind: "status", status: "waiting" },
		]);
	});

	it("rejects an interrupt when no turn is running", async () => {
		const input = createSdkInput();
		const turns = codexTurnEvents(input.messages, vi.fn(), "session s");
		await expect(turns.interrupt()).rejects.toThrow("no codex turn running");
	});
});
