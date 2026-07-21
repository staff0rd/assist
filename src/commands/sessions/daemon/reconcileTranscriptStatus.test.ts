import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { reconcileTranscriptStatus } from "./reconcileTranscriptStatus";
import { readTranscriptTail } from "../shared/readTranscriptTail";

vi.mock("../shared/readTranscriptTail", () => ({
	readTranscriptTail: vi.fn(),
}));

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const readMock = readTranscriptTail as unknown as ReturnType<typeof vi.fn>;

function session(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		status: "running",
		cwd: "/home/me/repo",
		claudeSessionId: "abc-123",
		transcriptPath: "/path/abc-123.jsonl",
		...overrides,
	} as unknown as Session;
}

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

describe("reconcileTranscriptStatus", () => {
	beforeEach(() => vi.clearAllMocks());

	it("heals a stranded running card to waiting on the next append (dropped waiting edge)", async () => {
		readMock.mockResolvedValue(endTurn());
		const onStatusChange = vi.fn();
		const s = session({ status: "running" });

		await reconcileTranscriptStatus(s, onStatusChange);

		expect(onStatusChange).toHaveBeenCalledWith(s, "waiting");
	});

	it("does not fire when the transcript already agrees with the current status", async () => {
		readMock.mockResolvedValue(pendingBash());
		const onStatusChange = vi.fn();

		await reconcileTranscriptStatus(
			session({ status: "running" }),
			onStatusChange,
		);

		expect(onStatusChange).not.toHaveBeenCalled();
	});

	it("keeps a permission-blocked session waiting despite a pending tool_use", async () => {
		readMock.mockResolvedValue(pendingBash());
		const onStatusChange = vi.fn();

		await reconcileTranscriptStatus(
			session({ status: "waiting", permissionActive: true }),
			onStatusChange,
		);

		expect(onStatusChange).not.toHaveBeenCalled();
	});

	it("clears the permission flag once the transcript derives running", async () => {
		readMock.mockResolvedValue([
			...pendingBash(),
			{
				type: "user",
				message: {
					content: [{ type: "tool_result", tool_use_id: "t1", content: "ok" }],
				},
			},
		]);
		const s = session({ status: "waiting", permissionActive: true });

		await reconcileTranscriptStatus(s, vi.fn());

		expect(s.permissionActive).toBe(false);
	});

	it("never resurrects a finished card", async () => {
		readMock.mockResolvedValue(pendingBash());
		const onStatusChange = vi.fn();

		await reconcileTranscriptStatus(
			session({ status: "done" }),
			onStatusChange,
		);
		await reconcileTranscriptStatus(
			session({ status: "error" }),
			onStatusChange,
		);

		expect(readMock).not.toHaveBeenCalled();
		expect(onStatusChange).not.toHaveBeenCalled();
	});
});
