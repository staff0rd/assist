import { describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { createSdkSessionProcess } from "./sdk/createSdkSessionProcess";
import { wireSdkEvents } from "./wireSdkEvents";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

function sdkSession(status: "running" | "waiting" | "done") {
	const control = createSdkSessionProcess("1", new AbortController());
	const session = makeSession({ id: "1", status, pty: control.process });
	const onStatusChange = vi.fn();
	const notify = vi.fn();
	wireSdkEvents(session, onStatusChange, notify);
	return { control, session, onStatusChange, notify };
}

describe("wireSdkEvents", () => {
	it("sets the session status from SDK turn events", () => {
		const { control, session, onStatusChange } = sdkSession("waiting");
		control.emit({ kind: "status", status: "running" });
		expect(onStatusChange).toHaveBeenCalledWith(session, "running");
	});

	it("does not repeat the current status", () => {
		const { control, onStatusChange } = sdkSession("running");
		control.emit({ kind: "status", status: "running" });
		expect(onStatusChange).not.toHaveBeenCalled();
	});

	it("records the activity and broadcasts it", () => {
		const { control, session, notify } = sdkSession("running");
		control.emit({ kind: "activity", text: "Working · Bash ls" });
		expect(session.sdkActivity).toBe("Working · Bash ls");
		control.emit({ kind: "activity", text: null });
		expect(session.sdkActivity).toBeUndefined();
		expect(notify).toHaveBeenCalledTimes(2);
	});

	it("ignores events once the session is done", () => {
		const { control, onStatusChange } = sdkSession("done");
		control.emit({ kind: "status", status: "running" });
		expect(onStatusChange).not.toHaveBeenCalled();
	});
});
