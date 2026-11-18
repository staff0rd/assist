import { afterEach, describe, expect, it, vi } from "vitest";
import type { SdkSessionEvent } from "../../../../shared/harnessAdapters/types";
import { publishWorkflowOutput } from "./publishWorkflowOutput";

afterEach(() => vi.useRealTimers());

describe("publishWorkflowOutput", () => {
	it("publishes the command and buffered lines throttled, then clears on end", () => {
		vi.useFakeTimers({ now: 1000 });
		const events: SdkSessionEvent[] = [];
		const output = publishWorkflowOutput("assist review 2285", (event) =>
			events.push(event),
		);
		output.append("stdout", "[claude] Read a.ts\n");
		output.append("stderr", "boom\n");
		expect(events).toEqual([]);
		vi.advanceTimersByTime(200);
		expect(events).toEqual([
			{
				kind: "workflow",
				workflow: {
					command: "assist review 2285",
					startedAt: 1000,
					lines: [
						{ stream: "stdout", text: "[claude] Read a.ts" },
						{ stream: "stderr", text: "boom" },
					],
				},
			},
		]);
		output.append("stdout", "late\n");
		output.end();
		vi.advanceTimersByTime(200);
		expect(events.at(-1)).toEqual({ kind: "workflow", workflow: null });
		expect(events).toHaveLength(2);
	});
});
