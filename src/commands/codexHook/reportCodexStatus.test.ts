import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSetSessionStatus = vi.fn();

vi.mock("../sessions/setSessionStatus", () => ({
	setSessionStatus: (status: string, opts: unknown) =>
		mockSetSessionStatus(status, opts),
}));

import { reportCodexStatus } from "./reportCodexStatus";

beforeEach(() => {
	vi.clearAllMocks();
});

describe("reportCodexStatus", () => {
	it("pushes an ack'd running on a prompt submission", async () => {
		await reportCodexStatus("UserPromptSubmit", false);

		expect(mockSetSessionStatus).toHaveBeenCalledWith("running", {
			source: "prompt",
			ack: true,
			readsClaudeHookInput: false,
		});
	});

	it("pushes an ack'd waiting when the turn stops", async () => {
		await reportCodexStatus("Stop", false);

		expect(mockSetSessionStatus).toHaveBeenCalledWith("waiting", {
			source: "stop",
			ack: true,
			readsClaudeHookInput: false,
		});
	});

	it("stays silent for events that carry no status", async () => {
		await reportCodexStatus("SessionEnd", false);

		expect(mockSetSessionStatus).not.toHaveBeenCalled();
	});
});
