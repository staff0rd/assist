import { beforeEach, describe, expect, it, vi } from "vitest";
import { assistArgsHarness } from "./assistArgsHarness";
import { createAssistSession } from "./createAssistSession";
import { spawnPty } from "./spawnPty";

vi.mock("./spawnPty", () => ({ spawnPty: vi.fn(() => ({ fake: "pty" })) }));
vi.mock("./assistArgsHarness", () => ({ assistArgsHarness: vi.fn() }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const unresolved = () => {
	throw new Error("could not resolve the harness from config (bad)");
};

describe("createAssistSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(assistArgsHarness).mockReturnValue("claude");
	});

	it("creates the session with Auto start on when meta asks for it", () => {
		const session = createAssistSession("1", ["draft", "--once"], "/git/app", {
			autoApprove: true,
		});

		expect(session.autoApprove).toBe(true);
	});

	it("leaves Auto start off by default", () => {
		const session = createAssistSession("1", ["draft", "--once"], "/git/app");

		expect(session.autoApprove).toBeUndefined();
	});

	it("fails the session with the reason instead of falling back to a terminal", () => {
		vi.mocked(assistArgsHarness).mockImplementation(unresolved);

		const session = createAssistSession("1", ["backlog", "run", "a1"], "/r");

		expect(session.status).toBe("error");
		expect(session.error).toMatch(/could not resolve the harness/);
		expect(session.scrollback).toMatch(/could not resolve the harness/);
		expect(session.pty).toBeNull();
		expect(spawnPty).not.toHaveBeenCalled();
	});

	it("holds an unresolvable start so it is refused when it starts", () => {
		vi.mocked(assistArgsHarness).mockImplementation(unresolved);

		const session = createAssistSession(
			"1",
			["backlog", "run", "a1"],
			"/r",
			undefined,
			true,
		);

		expect(session.status).toBe("running");
		expect(session.drivenStart).toBeUndefined();
		expect(() => session.pendingStart?.()).toThrow(/could not resolve/);
		expect(spawnPty).not.toHaveBeenCalled();
	});
});
