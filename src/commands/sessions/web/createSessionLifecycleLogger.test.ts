import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { detectPlatform } from "../../../lib/detectPlatform";
import { createSessionLifecycleLogger } from "./createSessionLifecycleLogger";

vi.mock("../../../lib/detectPlatform");

let logSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	vi.mocked(detectPlatform).mockReturnValue("macos");
	logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
	logSpy.mockRestore();
});

function lines(): string[] {
	return logSpy.mock.calls.map((c: unknown[]) => String(c[0]));
}

function sessionsLine(sessions: object[]): string {
	return JSON.stringify({ type: "sessions", sessions });
}

describe("createSessionLifecycleLogger", () => {
	it("logs a start with the repo name derived from the cwd", () => {
		const log = createSessionLifecycleLogger();
		log(
			sessionsLine([{ id: "1", status: "running", cwd: "/home/me/nextgen" }]),
		);

		expect(lines()).toHaveLength(1);
		expect(lines()[0]).toContain("session started: 1 nextgen [macos daemon]");
	});

	it("labels local sessions with the local platform", () => {
		vi.mocked(detectPlatform).mockReturnValue("linux");
		const log = createSessionLifecycleLogger();
		log(sessionsLine([{ id: "1", cwd: "/home/me/nextgen" }]));

		expect(lines()[0]).toContain("session started: 1 nextgen [linux daemon]");
	});

	it("still labels local sessions wsl when running under wsl", () => {
		vi.mocked(detectPlatform).mockReturnValue("wsl");
		const log = createSessionLifecycleLogger();
		log(sessionsLine([{ id: "1", cwd: "/home/me/nextgen" }]));

		expect(lines()[0]).toContain("session started: 1 nextgen [wsl daemon]");
	});

	it("derives the repo name from a windows cwd and labels the windows daemon", () => {
		const log = createSessionLifecycleLogger();
		log(sessionsLine([{ id: "w-2", cwd: "C:\\git\\nextgen" }]));

		expect(lines()[0]).toContain(
			"session started: w-2 nextgen [windows daemon]",
		);
	});

	it("includes backlog item and phase when known", () => {
		const log = createSessionLifecycleLogger();
		log(
			sessionsLine([
				{
					id: "1",
					cwd: "/repo",
					activity: { itemId: 358, phase: 2, totalPhases: 3 },
				},
			]),
		);

		expect(lines()[0]).toContain("session started: 1 repo #358 phase 2/3");
	});

	it("ignores non-sessions lines and malformed json", () => {
		const log = createSessionLifecycleLogger();
		log(JSON.stringify({ type: "output", sessionId: "1", data: "x" }));
		log("not json");

		expect(lines()).toHaveLength(0);
	});

	it("retains repo and backlog metadata for the end event after removal", () => {
		const log = createSessionLifecycleLogger();
		log(
			sessionsLine([
				{ id: "w-1", cwd: "C:\\git\\nextgen", activity: { itemId: 358 } },
			]),
		);
		log(sessionsLine([]));

		expect(lines()).toHaveLength(2);
		expect(lines()[1]).toContain(
			"session ended: w-1 nextgen #358 [windows daemon]",
		);
	});

	it("logs an end once when a session reports done, not again on removal", () => {
		const log = createSessionLifecycleLogger();
		log(sessionsLine([{ id: "1", cwd: "/repo", status: "running" }]));
		log(sessionsLine([{ id: "1", cwd: "/repo", status: "done" }]));
		log(sessionsLine([]));

		const ends = lines().filter((l) => l.includes("session ended"));
		expect(ends).toHaveLength(1);
	});
});
