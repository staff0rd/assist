import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { reconcileTranscriptStatus } from "./reconcileTranscriptStatus";
import { readTranscriptTail } from "../shared/readTranscriptTail";

vi.mock("../shared/readTranscriptTail", () => ({
	readTranscriptTail: vi.fn(),
}));

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const readMock = readTranscriptTail as unknown as ReturnType<typeof vi.fn>;

const transcriptPath = "/path/abc-123.jsonl";

function endTurn() {
	return [
		{ type: "user", message: { content: "hi" } },
		{
			type: "assistant",
			message: {
				stop_reason: "end_turn",
				content: [{ type: "text", text: "done" }],
			},
		},
	];
}

function pendingBash() {
	return [
		{ type: "user", message: { content: "run" } },
		{
			type: "assistant",
			message: {
				stop_reason: "tool_use",
				content: [{ type: "tool_use", id: "t1", name: "Bash", input: {} }],
			},
		},
	];
}

function resolvedBash(uuid: string) {
	return [
		{ type: "user", uuid: "u-prompt", message: { content: "run" } },
		{
			type: "assistant",
			uuid: "u-assistant",
			message: {
				stop_reason: "tool_use",
				content: [{ type: "tool_use", id: "t1", name: "Bash", input: {} }],
			},
		},
		{
			type: "user",
			uuid,
			message: {
				content: [{ type: "tool_result", tool_use_id: "t1", content: "ok" }],
			},
		},
	];
}

describe("reconcileTranscriptStatus", () => {
	beforeEach(() => vi.clearAllMocks());

	it("heals a stranded running card to waiting on the next append (dropped waiting edge)", async () => {
		readMock.mockResolvedValue(endTurn());
		const onStatusChange = vi.fn();
		const s = makeSession({ transcriptPath, status: "running" });

		await reconcileTranscriptStatus(s, onStatusChange);

		expect(onStatusChange).toHaveBeenCalledWith(s, "waiting");
	});

	it("does not fire when the transcript already agrees with the current status", async () => {
		readMock.mockResolvedValue(pendingBash());
		const onStatusChange = vi.fn();

		await reconcileTranscriptStatus(
			makeSession({ transcriptPath, status: "running" }),
			onStatusChange,
		);

		expect(onStatusChange).not.toHaveBeenCalled();
	});

	it("keeps a permission-blocked session waiting despite a pending tool_use", async () => {
		readMock.mockResolvedValue(pendingBash());
		const onStatusChange = vi.fn();

		await reconcileTranscriptStatus(
			makeSession({
				transcriptPath,
				status: "waiting",
				permissionActive: true,
			}),
			onStatusChange,
		);

		expect(onStatusChange).not.toHaveBeenCalled();
	});

	it("leaves the permission flag for a set-status running hook to clear", async () => {
		readMock.mockResolvedValue(resolvedBash("u-result"));
		const s = makeSession({
			transcriptPath,
			status: "waiting",
			permissionActive: true,
		});

		await reconcileTranscriptStatus(s, vi.fn());

		expect(s.permissionActive).toBe(true);
	});

	it("#a856: keeps a waiting permission prompt waiting when the transcript has not advanced", async () => {
		readMock.mockResolvedValue(resolvedBash("u-result"));
		const onStatusChange = vi.fn();
		const s = makeSession({
			transcriptPath,
			status: "waiting",
			permissionActive: true,
		});

		await reconcileTranscriptStatus(s, onStatusChange);
		await reconcileTranscriptStatus(s, onStatusChange);

		expect(onStatusChange).not.toHaveBeenCalled();
		expect(s.status).toBe("waiting");
	});

	it("skips re-deriving when the conversational tail is unchanged", async () => {
		readMock.mockResolvedValue(resolvedBash("u-result"));
		const onStatusChange = vi.fn();
		const s = makeSession({ transcriptPath, status: "waiting" });

		await reconcileTranscriptStatus(s, onStatusChange);
		onStatusChange.mockClear();
		s.status = "waiting";
		await reconcileTranscriptStatus(s, onStatusChange);

		expect(onStatusChange).not.toHaveBeenCalled();
	});

	it("re-derives once the transcript advances", async () => {
		readMock.mockResolvedValue(resolvedBash("u-result"));
		const onStatusChange = vi.fn();
		const s = makeSession({
			transcriptPath,
			status: "waiting",
			permissionActive: true,
		});

		await reconcileTranscriptStatus(s, onStatusChange);
		s.permissionActive = false;
		readMock.mockResolvedValue(resolvedBash("u-result-2"));
		await reconcileTranscriptStatus(s, onStatusChange);

		expect(onStatusChange).toHaveBeenCalledWith(s, "running");
	});

	it("never resurrects a finished card", async () => {
		readMock.mockResolvedValue(pendingBash());
		const onStatusChange = vi.fn();

		await reconcileTranscriptStatus(
			makeSession({ transcriptPath, status: "done" }),
			onStatusChange,
		);
		await reconcileTranscriptStatus(
			makeSession({ transcriptPath, status: "error" }),
			onStatusChange,
		);

		expect(onStatusChange).not.toHaveBeenCalled();
	});

	it("never resurrects a stopped card held for durable close", async () => {
		readMock.mockResolvedValue(pendingBash());
		const onStatusChange = vi.fn();

		await reconcileTranscriptStatus(
			makeSession({ transcriptPath, status: "stopped" }),
			onStatusChange,
		);

		expect(onStatusChange).not.toHaveBeenCalled();
	});
});

describe("reconcileTranscriptStatus last user message", () => {
	beforeEach(() => vi.clearAllMocks());

	it("stores the newest prompt and notifies", async () => {
		readMock.mockResolvedValue(endTurn());
		const notify = vi.fn();
		const s = makeSession({ transcriptPath, status: "running" });

		await reconcileTranscriptStatus(s, vi.fn(), notify);

		expect(s.lastUserMessage).toBe("hi");
		expect(notify).toHaveBeenCalledTimes(1);
	});

	it("keeps extracting for a finished card", async () => {
		readMock.mockResolvedValue(endTurn());
		const notify = vi.fn();
		const s = makeSession({ transcriptPath, status: "done" });

		await reconcileTranscriptStatus(s, vi.fn(), notify);

		expect(s.lastUserMessage).toBe("hi");
		expect(notify).toHaveBeenCalledTimes(1);
	});

	it("does not notify when the prompt is unchanged", async () => {
		readMock.mockResolvedValue(resolvedBash("u-result"));
		const notify = vi.fn();
		const s = makeSession({ transcriptPath, status: "waiting" });

		await reconcileTranscriptStatus(s, vi.fn(), notify);
		notify.mockClear();
		readMock.mockResolvedValue(resolvedBash("u-result-2"));
		await reconcileTranscriptStatus(s, vi.fn(), notify);

		expect(s.lastUserMessage).toBe("run");
		expect(notify).not.toHaveBeenCalled();
	});
});
