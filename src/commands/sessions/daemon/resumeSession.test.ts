import { describe, expect, it, vi } from "vitest";
import { resumeSession } from "./resumeSession";
import { spawnClaude } from "./spawnClaude";

vi.mock("./spawnClaude", () => ({
	spawnClaude: vi.fn(() => ({ fake: "pty" })),
}));

const spawnClaudeMock = spawnClaude as unknown as ReturnType<typeof vi.fn>;

describe("resumeSession", () => {
	it("opens waiting because a bare claude --resume sits idle awaiting input", () => {
		const session = resumeSession("3", "abc12345", "/repo");

		expect(session.status).toBe("waiting");
		expect(session.runningSince).toBeNull();
		expect(session.runningMs).toBe(0);
	});

	it("resumes without a nudge prompt so it does not start a turn", () => {
		resumeSession("3", "abc12345", "/repo");

		expect(spawnClaudeMock).toHaveBeenCalledWith(
			expect.objectContaining({ resumeSessionId: "abc12345" }),
		);
		expect(spawnClaudeMock.mock.calls[0]?.[0]?.prompt).toBeUndefined();
	});
});
