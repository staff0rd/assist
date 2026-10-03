import { beforeEach, describe, expect, it, vi } from "vitest";
import { makePty } from "../../../test/mothers/makePty";
import type * as makePtyModule from "../../../test/mothers/makePty";
import { makeSession } from "../../../test/mothers/makeSession";
import { handlePtyExit } from "./handlePtyExit";
import { retrySession } from "./retrySession";
import { spawnPty } from "./spawnPty";

vi.mock("./spawnPty", async () => {
	const { makePty } = await vi.importActual<typeof makePtyModule>(
		"../../../test/mothers/makePty",
	);
	return { spawnPty: vi.fn(() => makePty().pty) };
});

const spawnPtyMock = spawnPty as unknown as ReturnType<typeof vi.fn>;

describe("retrySession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("respawns a run session via assist run", () => {
		const session = makeSession({
			id: "1",
			status: "done",
			commandType: "run",
			runName: "build",
			runArgs: ["--watch"],
			scrollback: "old output",
			restored: false,
			cwd: "/home/user/repo",
		});

		expect(retrySession(session, new Set(), vi.fn())).toBe(true);

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "run", "build", "--watch"],
			"/home/user/repo",
		);
		expect(session.status).toBe("running");
		expect(session.scrollback).toBe("");
		expect(session.restored).toBeUndefined();
	});

	it("respawns an assist session from its persisted args", () => {
		const session = makeSession({
			id: "1",
			status: "done",
			commandType: "assist",
			assistArgs: ["draft"],
			scrollback: "old output",
			restored: false,
			cwd: "/home/user/repo",
		});

		expect(retrySession(session, new Set(), vi.fn())).toBe(true);

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "draft"],
			"/home/user/repo",
			"1",
		);
		expect(session.status).toBe("running");
		expect(session.restored).toBeUndefined();
	});

	it("kills the running process tree and defers the respawn until it exits", () => {
		const killSpy = vi.spyOn(process, "kill").mockImplementation(() => true);
		const { pty } = makePty(4321);
		const session = makeSession({
			id: "1",
			commandType: "run",
			status: "running",
			runName: "start:dev",
			runArgs: [],
			cwd: "/home/user/repo",
			pty,
		});

		expect(retrySession(session, new Set(), vi.fn())).toBe(true);

		expect(killSpy).toHaveBeenCalledWith(-4321, "SIGHUP");
		expect(pty.kill).not.toHaveBeenCalled();
		expect(spawnPtyMock).not.toHaveBeenCalled();
		expect(session.pendingRestart).toBeTypeOf("function");

		session.pendingRestart?.();

		expect(spawnPtyMock).toHaveBeenCalledWith(
			["assist", "run", "start:dev"],
			"/home/user/repo",
		);
		expect(session.status).toBe("running");
		killSpy.mockRestore();
	});

	it("keeps a retried session running when the old pty's exit lands", () => {
		const killSpy = vi.spyOn(process, "kill").mockImplementation(() => true);
		const onStatusChange = vi.fn();
		const session = makeSession({
			id: "1",
			commandType: "run",
			status: "running",
			runName: "start:dev",
			runArgs: [],
			cwd: "/home/user/repo",
			pty: makePty(4321).pty,
		});

		retrySession(session, new Set(), onStatusChange);
		handlePtyExit(session, 0, onStatusChange);

		expect(onStatusChange).not.toHaveBeenCalled();
		expect(session.status).toBe("running");
		expect(session.pty).not.toBeNull();
		expect(session.pendingRestart).toBeUndefined();
		killSpy.mockRestore();
	});

	it("does not retry claude sessions", () => {
		const session = makeSession({
			id: "1",
			commandType: "claude",
			status: "done",
		});

		expect(retrySession(session, new Set(), vi.fn())).toBe(false);
		expect(spawnPtyMock).not.toHaveBeenCalled();
	});

	it("does not retry an assist session without persisted args", () => {
		const session = makeSession({
			id: "1",
			commandType: "assist",
			status: "done",
		});

		expect(retrySession(session, new Set(), vi.fn())).toBe(false);
		expect(spawnPtyMock).not.toHaveBeenCalled();
	});
});
