import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";

vi.mock("./bindCodexSession", () => ({ bindCodexSession: vi.fn() }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

import { applyCodexLaunch } from "./applyCodexLaunch";
import { bindCodexSession } from "./bindCodexSession";

const launch = (harnessSessionId?: string) => ({
	kind: "command" as const,
	harness: "codex" as const,
	harnessSessionId,
	startedAt: 1000,
});

describe("applyCodexLaunch", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("binds the session to the conversation a resumed launch reports", () => {
		const session = makeSession({ harness: "codex", harnessSessionId: "old" });
		const notify = vi.fn();

		applyCodexLaunch(session, launch("resumed"), notify);

		expect(session.harnessSessionId).toBe("resumed");
		expect(notify).toHaveBeenCalled();
		expect(bindCodexSession).not.toHaveBeenCalled();
	});

	it("drops a stale binding and rebinds from the launch time for a fresh launch", () => {
		const session = makeSession({ harness: "codex", harnessSessionId: "old" });
		const notify = vi.fn();

		applyCodexLaunch(session, launch(), notify);

		expect(session.harnessSessionId).toBeUndefined();
		expect(bindCodexSession).toHaveBeenCalledWith(session, notify, 1000);
	});
});
