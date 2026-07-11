import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("../sessions/shared/findSessionJsonlPath", () => ({
	findSessionJsonlPath: vi.fn(),
}));

vi.mock("../sessions/daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));

vi.mock("./appendComment", () => ({
	appendComment: vi.fn(),
}));

vi.mock("./shared", () => ({
	getReady: vi.fn(() => Promise.resolve({ orm: {} })),
}));

import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { findSessionJsonlPath } from "../sessions/shared/findSessionJsonlPath";
import { appendComment } from "./appendComment";
import { verifyResumeConversation } from "./verifyResumeConversation";

const mockFind = findSessionJsonlPath as unknown as MockInstance;
const mockAppendDaemonLog = appendDaemonLog as unknown as MockInstance;
const mockAppendComment = appendComment as unknown as MockInstance;

describe("verifyResumeConversation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	it("returns true when the conversation transcript resolves", async () => {
		mockFind.mockResolvedValueOnce("/path/to/sess.jsonl");

		const ok = await verifyResumeConversation(7, "sess-1", "phase 1/3");

		expect(ok).toBe(true);
		expect(mockAppendDaemonLog).not.toHaveBeenCalled();
	});

	it("returns false and surfaces the failure when no conversation is found", async () => {
		mockFind.mockResolvedValueOnce(null);

		const ok = await verifyResumeConversation(7, "gone-9", "phase 1/3");

		expect(ok).toBe(false);
		expect(mockAppendDaemonLog).toHaveBeenCalledTimes(1);
		expect(String(mockAppendDaemonLog.mock.calls[0][0])).toContain("gone-9");
		expect(mockAppendComment).toHaveBeenCalledWith(
			{},
			7,
			expect.stringContaining("Resume failed"),
		);
	});

	it("still fails cleanly when the comment write throws", async () => {
		mockFind.mockResolvedValueOnce(null);
		mockAppendComment.mockRejectedValueOnce(new Error("db down"));

		await expect(
			verifyResumeConversation(7, "gone-9", "phase 1/3"),
		).resolves.toBe(false);
	});
});
