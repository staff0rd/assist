import type { ThreadEvent } from "@openai/codex-sdk";
import { daemonLog } from "../../daemonLog";
import type { DrivenTurnEvent } from "../DrivenTurnEvent";
import { codexEventTurnEvents } from "./codexEventTurnEvents";

type CodexRunTurn = (
	text: string,
	signal: AbortSignal,
) => Promise<AsyncIterable<ThreadEvent>>;

/* why: Codex has no streaming input or mid-turn steering, so each input message
 * runs as its own turn; the generic tracker queues anything sent meanwhile and
 * pushes it once this loop reports the turn waiting. */
export function codexTurnEvents(
	input: AsyncIterable<string>,
	runTurn: CodexRunTurn,
	label: string,
) {
	let current: AbortController | undefined;
	async function* events(): AsyncGenerator<DrivenTurnEvent> {
		for await (const text of input) {
			const turn = new AbortController();
			current = turn;
			yield { kind: "status", status: "running" };
			try {
				for await (const event of await runTurn(text, turn.signal))
					yield* codexEventTurnEvents(event, label);
			} catch (error) {
				daemonLog(
					turn.signal.aborted
						? `${label} codex turn aborted`
						: `${label} codex turn failed: ${error instanceof Error ? error.message : String(error)}`,
				);
			} finally {
				current = undefined;
			}
			yield { kind: "status", status: "waiting" };
		}
	}
	return {
		events: events(),
		interrupt: async () => {
			if (!current) throw new Error("no codex turn running");
			current.abort();
		},
	};
}
