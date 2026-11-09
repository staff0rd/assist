import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";

vi.mock("./bindConversation", () => ({ bindConversation: vi.fn() }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

import { applyLateBoundLaunch } from "./applyLateBoundLaunch";
import { bindConversation } from "./bindConversation";

const launch = (harnessSessionId?: string) => ({
	kind: "command" as const,
	harness: "codex" as const,
	harnessSessionId,
	startedAt: 1000,
});

describe("applyLateBoundLaunch", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("binds the session to the conversation a resumed launch reports and rewatches it", () => {
		const session = makeSession({ harness: "codex", harnessSessionId: "old" });
		const notify = vi.fn();
		const onBound = vi.fn();

		applyLateBoundLaunch(session, launch("resumed"), notify, onBound);

		expect(session.harnessSessionId).toBe("resumed");
		expect(onBound).toHaveBeenCalledWith(session);
		expect(notify).toHaveBeenCalled();
		expect(bindConversation).not.toHaveBeenCalled();
	});

	it("drops a stale binding and rebinds from the launch time for a fresh launch", () => {
		const session = makeSession({ harness: "codex", harnessSessionId: "old" });
		const notify = vi.fn();
		const onBound = vi.fn();

		applyLateBoundLaunch(session, launch(), notify, onBound);

		expect(session.harnessSessionId).toBeUndefined();
		expect(session.claudeSessionId).toBeUndefined();
		expect(onBound).toHaveBeenCalledWith(session);
		expect(bindConversation).toHaveBeenCalledWith(
			session,
			notify,
			1000,
			onBound,
		);
	});
});
