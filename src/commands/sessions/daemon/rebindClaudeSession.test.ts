import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { rebindClaudeSession } from "./rebindClaudeSession";
import { watchTranscript } from "./watchTranscript";

vi.mock("./watchTranscript", () => ({ watchTranscript: vi.fn() }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const watchMock = watchTranscript as unknown as ReturnType<typeof vi.fn>;

describe("rebindClaudeSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("follows the session to the transcript /clear started", () => {
		const s = makeSession({ claudeSessionId: "before-clear" });
		const notify = vi.fn();
		const onStatusChange = vi.fn();

		rebindClaudeSession(s, "after-clear", notify, onStatusChange);

		expect(s.claudeSessionId).toBe("after-clear");
		expect(watchMock).toHaveBeenCalledWith(s, notify, onStatusChange);
	});

	it("leaves the binding alone when the conversation has not moved", () => {
		const s = makeSession({ claudeSessionId: "before-clear" });

		rebindClaudeSession(s, "before-clear", vi.fn(), vi.fn());

		expect(watchMock).not.toHaveBeenCalled();
	});

	it("ignores a hook that reported no conversation id", () => {
		const s = makeSession({ claudeSessionId: "before-clear" });

		rebindClaudeSession(s, undefined, vi.fn(), vi.fn());

		expect(s.claudeSessionId).toBe("before-clear");
		expect(watchMock).not.toHaveBeenCalled();
	});
});
