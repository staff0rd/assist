import { describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import type { Session } from "./createSession";
import { watchPromptSubmit } from "./watchPromptSubmit";

const ENTER = "\r";

const restoredWaiting = {
	status: "waiting",
	restored: true,
} satisfies Partial<Session>;

describe("watchPromptSubmit", () => {
	it("flips a restored waiting session to running on Enter", () => {
		const session = makeSession(restoredWaiting);
		const onStatusChange = vi.fn();

		watchPromptSubmit(session, ENTER, onStatusChange);

		expect(onStatusChange).toHaveBeenCalledWith(session, "running");
	});

	it("flips on a submitted prompt whose keystrokes include Enter", () => {
		const session = makeSession(restoredWaiting);
		const onStatusChange = vi.fn();

		watchPromptSubmit(session, `hello${ENTER}`, onStatusChange);

		expect(onStatusChange).toHaveBeenCalledWith(session, "running");
	});

	it("ignores keystrokes without Enter", () => {
		const session = makeSession(restoredWaiting);
		const onStatusChange = vi.fn();

		watchPromptSubmit(session, "hello", onStatusChange);

		expect(onStatusChange).not.toHaveBeenCalled();
	});

	it("ignores Enter on a session that was not restored", () => {
		const session = makeSession({ ...restoredWaiting, restored: false });
		const onStatusChange = vi.fn();

		watchPromptSubmit(session, ENTER, onStatusChange);

		expect(onStatusChange).not.toHaveBeenCalled();
	});

	it("ignores Enter when the session is already running", () => {
		const session = makeSession({ ...restoredWaiting, status: "running" });
		const onStatusChange = vi.fn();

		watchPromptSubmit(session, ENTER, onStatusChange);

		expect(onStatusChange).not.toHaveBeenCalled();
	});
});
