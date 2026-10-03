import { beforeEach, describe, expect, it, vi } from "vitest";
import { makePty } from "../../../test/mothers/makePty";
import { makeSession } from "../../../test/mothers/makeSession";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { resizeSession } from "./writeToSession";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const daemonLogMock = daemonLog as unknown as ReturnType<typeof vi.fn>;

describe("resizeSession", () => {
	beforeEach(() => vi.clearAllMocks());

	it("resizes a live pty", () => {
		const { pty } = makePty();
		const sessions = new Map<string, Session>([
			["1", makeSession({ id: "1", status: "waiting", pty })],
		]);

		resizeSession(sessions, "1", 120, 40);

		expect(pty.resize).toHaveBeenCalledWith(120, 40);
	});

	it("does not throw and logs when the pty is dead (ENOTTY)", () => {
		const { pty } = makePty();
		pty.resize.mockImplementation(() => {
			throw new Error("ioctl(2) failed, ENOTTY");
		});
		const sessions = new Map<string, Session>([
			["1", makeSession({ id: "1", status: "waiting", pty })],
		]);

		expect(() => resizeSession(sessions, "1", 120, 40)).not.toThrow();
		expect(daemonLogMock).toHaveBeenCalledWith(
			expect.stringContaining("resize skipped (dead pty)"),
		);
	});

	it("skips a done session", () => {
		const { pty } = makePty();
		const sessions = new Map<string, Session>([
			["1", makeSession({ id: "1", status: "done", pty })],
		]);

		resizeSession(sessions, "1", 120, 40);

		expect(pty.resize).not.toHaveBeenCalled();
	});
});
