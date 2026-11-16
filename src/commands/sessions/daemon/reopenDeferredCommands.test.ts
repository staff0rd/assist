import { beforeEach, describe, expect, it, vi } from "vitest";
import { supersededPreviewMessage } from "../shared/supersededPreviewMessage";
import { daemonLog } from "./daemonLog";
import type { DeferredResult } from "./runDeferredCommand";
import type { SessionManager } from "./SessionManager";
import type { Session } from "./types";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const mockRun = vi.fn();
vi.mock("./runDeferredCommand", () => ({
	runDeferredCommand: (...args: unknown[]) => mockRun(...args),
}));

import { reopenDeferredCommands } from "./reopenDeferredCommands";

const command = {
	argv: ["backlog", "propose", "--json", "-"],
	stdin: "{}",
	cwd: "/repo",
};

function setup(
	sdk?: { send: ReturnType<typeof vi.fn> },
	pending: Record<string, unknown> = command,
) {
	const session = {
		id: "9",
		pty: sdk ? { sdk } : null,
		deferredCommands: [pending],
	} as unknown as Session;
	const sessions = new Map([["9", session]]);
	const manager = {
		session: (id: string) => sessions.get(id),
		io: { typePrompt: vi.fn() },
	} as unknown as SessionManager;
	reopenDeferredCommands(sessions.values(), manager);
	return session;
}

function finishWith(result: DeferredResult) {
	(mockRun.mock.calls[0][1] as (r: DeferredResult) => void)(result);
}

describe("reopenDeferredCommands", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRun.mockReset().mockReturnValue(42);
	});

	it("re-runs a pending command with the restored session's env and delivers its decision", () => {
		const sdk = { send: vi.fn() };
		const session = setup(sdk);

		const [run] = mockRun.mock.calls[0];
		expect(run).toMatchObject(command);
		expect(run.env).toMatchObject({
			ASSIST_SESSION_ID: "9",
			ASSIST_SESSION: "1",
		});
		expect(sdk.send).not.toHaveBeenCalled();
		expect(session.deferredCommands).toEqual([command]);
		expect(daemonLog).toHaveBeenCalledWith(
			expect.stringContaining(
				"defer-command backlog propose reopened after daemon restart",
			),
		);

		finishWith({ output: "Added item a1\n", exitCode: 0 });

		expect(sdk.send).toHaveBeenCalledWith(
			"`assist backlog propose` finished with exit code 0:\n\nAdded item a1",
		);
		expect(session.deferredCommands).toBeUndefined();
	});

	it("re-runs a pending command with its persisted backlog item id", () => {
		setup(
			{ send: vi.fn() },
			{
				...command,
				env: { ASSIST_BACKLOG_ITEM_ID: "a1673" },
			},
		);

		expect(mockRun.mock.calls[0][0].env).toMatchObject({
			ASSIST_SESSION_ID: "9",
			ASSIST_BACKLOG_ITEM_ID: "a1673",
		});
	});

	it("drops the daemon's own backlog item id when none was persisted", () => {
		vi.stubEnv("ASSIST_BACKLOG_ITEM_ID", "999");
		setup({ send: vi.fn() });
		vi.unstubAllEnvs();

		expect(mockRun.mock.calls[0][0].env.ASSIST_BACKLOG_ITEM_ID).toBeUndefined();
	});

	it("delivers nothing when the reopened preview is superseded", () => {
		const sdk = { send: vi.fn() };
		const session = setup(sdk);

		finishWith({ output: `${supersededPreviewMessage}\n`, exitCode: 0 });

		expect(sdk.send).not.toHaveBeenCalled();
		expect(session.deferredCommands).toBeUndefined();
	});

	it("types a reopened decision into an idle terminal session", () => {
		const session = {
			id: "9",
			status: "waiting",
			pty: { write: vi.fn() },
			deferredCommands: [command],
		} as unknown as Session;
		const typePrompt = vi.fn();
		reopenDeferredCommands([session], {
			session: () => session,
			io: { typePrompt },
		});

		finishWith({ output: "Added item a1\n", exitCode: 0 });

		expect(typePrompt).toHaveBeenCalledWith(
			"9",
			"`assist backlog propose` finished with exit code 0:\n\nAdded item a1",
		);
		expect(session.deferredCommands).toBeUndefined();
	});

	it("re-runs a pending high-level review without the daemon's harness marker", () => {
		vi.stubEnv("CLAUDECODE", undefined);
		const review = {
			argv: ["review", "--high-level", "2264"],
			cwd: "/repo",
			env: {},
		};
		setup({ send: vi.fn() }, review);
		vi.unstubAllEnvs();

		const [run] = mockRun.mock.calls[0];
		expect(run).toMatchObject({ argv: review.argv, cwd: "/repo" });
		expect(run.env.CLAUDECODE).toBeUndefined();
		expect(daemonLog).toHaveBeenCalledWith(
			expect.stringContaining("reopened after daemon restart"),
		);
	});

	it("drops pending commands of a session that is not live", () => {
		const session = setup();

		expect(mockRun).not.toHaveBeenCalled();
		expect(session.deferredCommands).toBeUndefined();
	});
});
