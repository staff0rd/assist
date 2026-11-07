import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import { makeBacklogItem } from "../../test/mothers/makeBacklogItem";

vi.mock("../../shared/spawnHarness", () => ({
	spawnHarness: vi.fn(),
}));

import { spawnHarness } from "../../shared/spawnHarness";
import { resumeDoneConversation } from "./resumeDoneConversation";

const mockSpawnHarness = spawnHarness as unknown as MockInstance;

describe("resumeDoneConversation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, "log").mockImplementation(() => {});
	});

	it("resumes the Claude session without a nudge prompt", async () => {
		mockSpawnHarness.mockReturnValue({ done: Promise.resolve(0) });
		const item = makeBacklogItem({ status: "done" });

		const result = await resumeDoneConversation(
			{ kind: "resume-done", item, resumeSessionId: "sess-1" },
			{ allowEdits: false },
		);

		expect(result).toBe(true);
		expect(mockSpawnHarness).toHaveBeenCalledWith("claude", "", {
			allowEdits: false,
			resumeSessionId: "sess-1",
			cwd: process.cwd(),
		});
	});

	it("resumes a Codex conversation with the Codex harness", async () => {
		mockSpawnHarness.mockReturnValue({ done: Promise.resolve(0) });
		const item = makeBacklogItem({ status: "done" });

		await resumeDoneConversation(
			{ kind: "resume-done", item, resumeSessionId: "codex-1" },
			{ harness: "codex" },
		);

		expect(mockSpawnHarness).toHaveBeenCalledWith("codex", "", {
			allowEdits: true,
			resumeSessionId: "codex-1",
			cwd: process.cwd(),
		});
	});

	it("returns false when Claude exits non-zero", async () => {
		mockSpawnHarness.mockReturnValue({ done: Promise.resolve(1) });
		const item = makeBacklogItem({ status: "done" });

		const result = await resumeDoneConversation({
			kind: "resume-done",
			item,
			resumeSessionId: "sess-1",
		});

		expect(result).toBe(false);
	});
});
