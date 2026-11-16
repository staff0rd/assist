import { describe, expect, it, vi } from "vitest";
import type { SdkSessionEvent } from "../../../../shared/harnessAdapters/types";
import { sdkSessionHandle } from "./sdkSessionHandle";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));

describe("sdkSessionHandle", () => {
	it("replays a resume that completed before a listener attached", () => {
		const sdk = sdkSessionHandle("session s", false);
		sdk.emit({ kind: "resumed" });
		const events: SdkSessionEvent[] = [];
		sdk.handle.onEvent((event) => events.push(event));
		expect(events).toEqual([{ kind: "resumed" }]);
	});

	it("replays nothing to a listener attached before any resume", () => {
		const sdk = sdkSessionHandle("session s", false);
		const events: SdkSessionEvent[] = [];
		sdk.handle.onEvent((event) => events.push(event));
		sdk.emit({ kind: "status", status: "waiting" });
		expect(events).toEqual([{ kind: "status", status: "waiting" }]);
	});
});
