import { describe, expect, it, vi } from "vitest";
import type { SdkSessionEvent } from "../../../../shared/harnessAdapters/types";
import { applyDrivenTurnEvent } from "./applyDrivenTurnEvent";
import { createSdkSessionProcess } from "./createSdkSessionProcess";
import { createSdkTurnTracker } from "./createSdkTurnTracker";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));

function apply(backgroundTasks: boolean) {
	const control = createSdkSessionProcess("7", new AbortController(), {
		backgroundTasks,
	});
	const events: SdkSessionEvent[] = [];
	control.process.sdk?.onEvent((event) => events.push(event));
	const turn = createSdkTurnTracker("session 7", control, vi.fn());
	applyDrivenTurnEvent(
		{ kind: "background", tasks: ["Bash"] },
		control,
		turn,
		backgroundTasks,
	);
	return { events, sdk: control.process.sdk };
}

describe("applyDrivenTurnEvent", () => {
	it("relays background tasks and exposes stopTask when the harness supports them", () => {
		const { events, sdk } = apply(true);
		expect(events).toEqual([{ kind: "background", tasks: ["Bash"] }]);
		expect(sdk?.stopTask).toBeTypeOf("function");
	});

	it("drops background tasks and omits stopTask when the harness does not support them", () => {
		const { events, sdk } = apply(false);
		expect(events).toEqual([]);
		expect(sdk?.stopTask).toBeUndefined();
	});
});
