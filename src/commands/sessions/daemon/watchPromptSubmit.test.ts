import { describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { watchPromptSubmit } from "./watchPromptSubmit";

const ENTER = "\r";

function makeSession(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "test",
		commandType: "claude",
		status: "waiting",
		startedAt: 0,
		runningMs: 0,
		runningSince: null,
		pty: null,
		scrollback: "",
		restored: true,
		...overrides,
	};
}

describe("watchPromptSubmit", () => {
	it("flips a restored waiting session to running on Enter", () => {
		const session = makeSession();
		const onStatusChange = vi.fn();

		watchPromptSubmit(session, ENTER, onStatusChange);

		expect(onStatusChange).toHaveBeenCalledWith(session, "running");
	});

	it("flips on a submitted prompt whose keystrokes include Enter", () => {
		const session = makeSession();
		const onStatusChange = vi.fn();

		watchPromptSubmit(session, `hello${ENTER}`, onStatusChange);

		expect(onStatusChange).toHaveBeenCalledWith(session, "running");
	});

	it("ignores keystrokes without Enter", () => {
		const session = makeSession();
		const onStatusChange = vi.fn();

		watchPromptSubmit(session, "hello", onStatusChange);

		expect(onStatusChange).not.toHaveBeenCalled();
	});

	it("ignores Enter on a session that was not restored", () => {
		const session = makeSession({ restored: false });
		const onStatusChange = vi.fn();

		watchPromptSubmit(session, ENTER, onStatusChange);

		expect(onStatusChange).not.toHaveBeenCalled();
	});

	it("ignores Enter when the session is already running", () => {
		const session = makeSession({ status: "running" });
		const onStatusChange = vi.fn();

		watchPromptSubmit(session, ENTER, onStatusChange);

		expect(onStatusChange).not.toHaveBeenCalled();
	});
});
