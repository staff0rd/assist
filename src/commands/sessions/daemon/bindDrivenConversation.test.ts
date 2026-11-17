import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { createSdkSessionProcess } from "./sdk/createSdkSessionProcess";
import { watchTranscript } from "./watchTranscript";
import { wireSdkEvents } from "./wireSdkEvents";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./watchTranscript", () => ({ watchTranscript: vi.fn() }));
vi.mock("./recordBoundPhaseSession", () => ({
	recordBoundPhaseSession: vi.fn(async () => {}),
}));
vi.mock("./rememberSessionTitle", () => ({ rememberSessionTitle: vi.fn() }));

function codexSdkSession(harnessSessionId?: string) {
	const control = createSdkSessionProcess("7", new AbortController());
	const session = makeSession({
		id: "7",
		status: "waiting",
		harness: "codex-sdk",
		cwd: "/repo",
		harnessSessionId,
		pty: control.process,
	});
	const notify = vi.fn();
	const onStatusChange = vi.fn();
	return { control, session, notify, onStatusChange };
}

function claudeSdkSession(claudeSessionId: string) {
	const control = createSdkSessionProcess("8", new AbortController());
	const session = makeSession({
		id: "8",
		status: "waiting",
		harness: "claude-sdk",
		cwd: "/repo",
		claudeSessionId,
		pty: control.process,
	});
	const notify = vi.fn();
	const onStatusChange = vi.fn();
	return { control, session, notify, onStatusChange };
}

describe("bindDrivenConversation", () => {
	beforeEach(() => vi.clearAllMocks());

	it("binds the driven thread as the session's conversation and watches its transcript", () => {
		const { control, session, notify, onStatusChange } = codexSdkSession();
		wireSdkEvents(session, onStatusChange, notify);
		control.emit({ kind: "conversation", id: "thread-1" });
		expect(session.harnessSessionId).toBe("thread-1");
		expect(watchTranscript).toHaveBeenCalledWith(
			session,
			notify,
			onStatusChange,
		);
		expect(notify).toHaveBeenCalled();
	});

	it("keeps a resumed session bound to the same thread without rebinding", () => {
		const { control, session, notify, onStatusChange } =
			codexSdkSession("thread-1");
		wireSdkEvents(session, onStatusChange, notify);
		control.emit({ kind: "conversation", id: "thread-1" });
		expect(session.harnessSessionId).toBe("thread-1");
		expect(watchTranscript).not.toHaveBeenCalled();
	});

	it("binds a thread that started before the session's listeners were wired", () => {
		const { control, session, notify, onStatusChange } = codexSdkSession();
		control.emit({ kind: "conversation", id: "thread-2" });
		wireSdkEvents(session, onStatusChange, notify);
		expect(session.harnessSessionId).toBe("thread-2");
	});

	it("rebinds a claude sdk session to the conversation /clear starts so restart resumes it", () => {
		const { control, session, notify, onStatusChange } =
			claudeSdkSession("before-clear");
		session.transcriptPath = "/repo/before-clear.jsonl";
		wireSdkEvents(session, onStatusChange, notify);
		control.emit({ kind: "conversation", id: "after-clear" });
		expect(session.claudeSessionId).toBe("after-clear");
		expect(session.transcriptPath).toBeUndefined();
		expect(watchTranscript).toHaveBeenCalledWith(
			session,
			notify,
			onStatusChange,
		);
	});

	it("keeps a claude sdk session on its conversation when init repeats the same id", () => {
		const { control, session, notify, onStatusChange } =
			claudeSdkSession("same");
		wireSdkEvents(session, onStatusChange, notify);
		control.emit({ kind: "conversation", id: "same" });
		expect(session.claudeSessionId).toBe("same");
		expect(watchTranscript).not.toHaveBeenCalled();
	});
});
