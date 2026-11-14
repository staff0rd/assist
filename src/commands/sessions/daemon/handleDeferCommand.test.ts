import { beforeEach, describe, expect, it, vi } from "vitest";
import { supersededPreviewMessage } from "../shared/supersededPreviewMessage";
import type { DeferredResult } from "./runDeferredCommand";
import { createSdkSessionProcess } from "./sdk/createSdkSessionProcess";
import { createSdkTurnTracker } from "./sdk/createSdkTurnTracker";
import type { SessionManager } from "./SessionManager";
import { daemonRestartInterruption } from "./SessionInterruption";
import type { Session } from "./types";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const mockRun = vi.fn();
vi.mock("./runDeferredCommand", () => ({
	runDeferredCommand: (...args: unknown[]) => mockRun(...args),
}));

import { handleDeferCommand } from "./handleDeferCommand";

const request = {
	sessionId: "7",
	argv: ["ask", "--title", "Plan", "--body", "-"],
	stdin: "# Plan",
	cwd: "/repo",
	env: { ASSIST_SESSION_ID: "7" },
};

const pending = { argv: request.argv, stdin: "# Plan", cwd: "/repo" };

function managerWith(sdk: { send: (text: string) => void } | undefined) {
	const sessions = new Map<string, Session>(
		sdk ? [["7", { id: "7", pty: { sdk } } as unknown as Session]] : [],
	);
	return {
		sessions,
		manager: {
			session: (id: string) => sessions.get(id),
		} as unknown as SessionManager,
	};
}

function replies(client: { send: ReturnType<typeof vi.fn> }) {
	return client.send.mock.calls.map(([raw]) => JSON.parse(raw as string));
}

function finishWith(result: DeferredResult) {
	const onDone = mockRun.mock.calls[0][1] as (r: DeferredResult) => void;
	onDone(result);
}

describe("defer-command handler", () => {
	beforeEach(() => {
		mockRun.mockReset().mockReturnValue(123);
	});

	it("declines a session that is not a Claude (SDK) session", () => {
		const client = { send: vi.fn() };

		handleDeferCommand(client, managerWith(undefined).manager, request);

		expect(mockRun).not.toHaveBeenCalled();
		expect(replies(client)).toEqual([
			{ type: "defer-command-result", accepted: false },
		]);
	});

	it("runs the command and delivers its decision as the session's next message", () => {
		const client = { send: vi.fn() };
		const sdk = { send: vi.fn() };

		handleDeferCommand(client, managerWith(sdk).manager, request);

		expect(mockRun).toHaveBeenCalledWith(
			{
				argv: request.argv,
				stdin: "# Plan",
				cwd: "/repo",
				env: request.env,
			},
			expect.any(Function),
		);
		expect(replies(client)).toEqual([
			{ type: "defer-command-result", accepted: true },
		]);
		expect(sdk.send).not.toHaveBeenCalled();

		finishWith({ output: "Approved.\n", exitCode: 0 });

		expect(sdk.send).toHaveBeenCalledWith(
			"`assist ask` finished with exit code 0:\n\nApproved.",
		);
	});

	it("delivers a rejection with its exit code", () => {
		const sdk = { send: vi.fn() };
		handleDeferCommand({ send: vi.fn() }, managerWith(sdk).manager, request);

		finishWith({ output: "Plan rejected: no\n", exitCode: 1 });

		expect(sdk.send).toHaveBeenCalledWith(
			"`assist ask` finished with exit code 1:\n\nPlan rejected: no",
		);
	});

	it("labels a nested command by its subcommands", () => {
		const sdk = { send: vi.fn() };
		handleDeferCommand({ send: vi.fn() }, managerWith(sdk).manager, {
			...request,
			argv: ["backlog", "propose", "--json", "-"],
		});

		finishWith({ output: "Added item a1\n", exitCode: 0 });

		expect(sdk.send).toHaveBeenCalledWith(
			"`assist backlog propose` finished with exit code 0:\n\nAdded item a1",
		);
	});

	it("delivers nothing when the preview was superseded", () => {
		const sdk = { send: vi.fn() };
		handleDeferCommand({ send: vi.fn() }, managerWith(sdk).manager, request);

		finishWith({
			output: `Awaiting your approval…\n${supersededPreviewMessage}\n`,
			exitCode: 0,
		});

		expect(sdk.send).not.toHaveBeenCalled();
	});

	it("drops the delivery when the session has gone", () => {
		const sdk = { send: vi.fn() };
		const { sessions, manager } = managerWith(sdk);
		handleDeferCommand({ send: vi.fn() }, manager, request);
		sessions.clear();

		finishWith({ output: "Approved.\n", exitCode: 0 });

		expect(sdk.send).not.toHaveBeenCalled();
	});

	it("tracks the command as pending until its decision is delivered", () => {
		const sdk = { send: vi.fn() };
		const { sessions, manager } = managerWith(sdk);
		handleDeferCommand({ send: vi.fn() }, manager, request);

		expect(sessions.get("7")?.deferredCommands).toEqual([pending]);

		finishWith({ output: "Approved.\n", exitCode: 0 });

		expect(sessions.get("7")?.deferredCommands).toBeUndefined();
	});

	it("stops tracking a superseded preview", () => {
		const { sessions, manager } = managerWith({ send: vi.fn() });
		handleDeferCommand({ send: vi.fn() }, manager, request);

		finishWith({ output: `${supersededPreviewMessage}\n`, exitCode: 0 });

		expect(sessions.get("7")?.deferredCommands).toBeUndefined();
	});

	it("leaves a preview killed by a daemon restart pending and delivers nothing", () => {
		const sdk = { send: vi.fn() };
		const { sessions, manager } = managerWith(sdk);
		handleDeferCommand({ send: vi.fn() }, manager, request);
		const session = sessions.get("7") as Session;
		session.interrupted = daemonRestartInterruption();

		finishWith({ output: "", exitCode: 1 });

		expect(sdk.send).not.toHaveBeenCalled();
		expect(session.deferredCommands).toEqual([pending]);
	});

	it("keeps a preview pending while the user chats and queues its decision behind the running turn", () => {
		const control = createSdkSessionProcess("7", new AbortController());
		const push = vi.fn();
		const turn = createSdkTurnTracker("session 7", control, push);
		const { sessions, manager } = managerWith(turn);
		handleDeferCommand({ send: vi.fn() }, manager, request);

		turn.send("while you wait, what about X?");

		expect(push).toHaveBeenCalledTimes(1);
		expect(sessions.get("7")?.deferredCommands).toEqual([pending]);

		finishWith({ output: "Approved.\n", exitCode: 0 });

		expect(push).toHaveBeenCalledTimes(1);
		turn.setStatus("waiting");
		expect(push).toHaveBeenLastCalledWith(
			"`assist ask` finished with exit code 0:\n\nApproved.",
		);
	});
});
