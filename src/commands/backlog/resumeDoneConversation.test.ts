import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HarnessKind } from "../../shared/harnesses";
import { makeBacklogItem } from "../../test/mothers/makeBacklogItem";

const resume = vi.hoisted(() => vi.fn());

vi.mock("../../shared/harnessAdapters/harnessAdapter", () => ({
	harnessAdapter: (kind?: HarnessKind) => ({
		resume: (...args: unknown[]) => resume(kind ?? "claude", ...args),
	}),
}));

import { resumeDoneConversation } from "./resumeDoneConversation";

describe("resumeDoneConversation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, "log").mockImplementation(() => {});
	});

	it("resumes the Claude session without a nudge prompt", async () => {
		resume.mockReturnValue({ done: Promise.resolve(0) });
		const item = makeBacklogItem({ status: "done" });

		const result = await resumeDoneConversation(
			{ kind: "resume-done", item, resumeSessionId: "sess-1" },
			{ allowEdits: false },
		);

		expect(result).toBe(true);
		expect(resume).toHaveBeenCalledWith("claude", "sess-1", "", {
			cwd: process.cwd(),
			allowEdits: false,
		});
	});

	it("resumes a Codex conversation through the Codex adapter", async () => {
		resume.mockReturnValue({ done: Promise.resolve(0) });
		const item = makeBacklogItem({ status: "done" });

		await resumeDoneConversation(
			{ kind: "resume-done", item, resumeSessionId: "codex-1" },
			{ harness: "codex" },
		);

		expect(resume).toHaveBeenCalledWith("codex", "codex-1", "", {
			cwd: process.cwd(),
			allowEdits: true,
		});
	});

	it("returns false when the harness exits non-zero", async () => {
		resume.mockReturnValue({ done: Promise.resolve(1) });
		const item = makeBacklogItem({ status: "done" });

		const result = await resumeDoneConversation({
			kind: "resume-done",
			item,
			resumeSessionId: "sess-1",
		});

		expect(result).toBe(false);
	});
});
