import { beforeEach, describe, expect, it, vi } from "vitest";
import { supersededPreviewMessage } from "../shared/supersededPreviewMessage";
import type { DeferredResult } from "./runDeferredCommand";
import { createSdkSessionProcess } from "./sdk/createSdkSessionProcess";
import { createSdkTurnTracker } from "./sdk/createSdkTurnTracker";
import type { SessionManager } from "./SessionManager";
import { daemonRestartInterruption } from "./SessionInterruption";
import type { Session } from "./types";

const mockLog = vi.fn();
vi.mock("./daemonLog", () => ({
	daemonLog: (...args: unknown[]) => mockLog(...args),
}));

const mockRun = vi.fn();
vi.mock("./runDeferredCommand", () => ({
	runDeferredCommand: (...args: unknown[]) => mockRun(...args),
}));

import { flushDeferredResults } from "./flushDeferredResults";
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
			io: { typePrompt: vi.fn() },
		} as unknown as SessionManager,
	};
}

function terminalManager(status: Session["status"]) {
	const session = {
		id: "7",
		status,
		pty: { write: vi.fn() },
	} as unknown as Session;
	const typePrompt = vi.fn();
	const manager = {
		session: (id: string) => (id === "7" ? session : undefined),
		io: { typePrompt },
	} as unknown as SessionManager;
	return { session, typePrompt, manager };
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

	it("declines a session that is not live", () => {
		const client = { send: vi.fn() };

		handleDeferCommand(client, managerWith(undefined).manager, request);

		expect(mockRun).not.toHaveBeenCalled();
		expect(replies(client)).toEqual([
			{ type: "defer-command-result", accepted: false },
		]);
	});

	it("declines an empty argv instead of running bare assist", () => {
		const client = { send: vi.fn() };
		const { sessions, manager } = managerWith({ send: vi.fn() });

		handleDeferCommand(client, manager, { ...request, argv: [] });

		expect(mockRun).not.toHaveBeenCalled();
		expect(sessions.get("7")?.deferredCommands).toBeUndefined();
		expect(replies(client)).toEqual([
			{ type: "defer-command-result", accepted: false },
		]);
		expect(mockLog).toHaveBeenCalledWith(
			"defer-command declined: session 7 sent an empty argv",
		);
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

	it("tracks only the allow-listed env keys of the caller's env", () => {
		const { sessions, manager } = managerWith({ send: vi.fn() });
		const env = {
			ASSIST_SESSION_ID: "7",
			ASSIST_BACKLOG_ITEM_ID: "a1673",
			PATH: "/usr/bin",
			SECRET_TOKEN: "s3cret",
		};
		handleDeferCommand({ send: vi.fn() }, manager, { ...request, env });

		expect(sessions.get("7")?.deferredCommands).toEqual([
			{ ...pending, env: { ASSIST_BACKLOG_ITEM_ID: "a1673" } },
		]);
		expect(mockRun.mock.calls[0][0].env).toEqual(env);
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

	describe("in a terminal (Codex) session", () => {
		const approved = "`assist ask` finished with exit code 0:\n\nApproved.";

		it("accepts the command", () => {
			const client = { send: vi.fn() };
			handleDeferCommand(client, terminalManager("waiting").manager, request);

			expect(replies(client)).toEqual([
				{ type: "defer-command-result", accepted: true },
			]);
		});

		it("types the decision into an idle session as its next turn", () => {
			const { typePrompt, manager } = terminalManager("waiting");
			handleDeferCommand({ send: vi.fn() }, manager, request);

			finishWith({ output: "Approved.\n", exitCode: 0 });

			expect(typePrompt).toHaveBeenCalledWith("7", approved);
		});

		it("queues the decision while a turn is running and types it once idle", () => {
			const { session, typePrompt, manager } = terminalManager("running");
			handleDeferCommand({ send: vi.fn() }, manager, request);

			finishWith({ output: "Approved.\n", exitCode: 0 });

			expect(typePrompt).not.toHaveBeenCalled();
			expect(session.pendingDeferredResults).toEqual([approved]);

			session.status = "waiting";
			flushDeferredResults(session, manager);

			expect(typePrompt).toHaveBeenCalledWith("7", approved);
			expect(session.pendingDeferredResults).toBeUndefined();
		});

		it("types nothing when the preview was superseded", () => {
			const { typePrompt, manager } = terminalManager("waiting");
			handleDeferCommand({ send: vi.fn() }, manager, request);

			finishWith({ output: `${supersededPreviewMessage}\n`, exitCode: 0 });

			expect(typePrompt).not.toHaveBeenCalled();
		});

		it("drops the decision when the session has ended", () => {
			const { session, typePrompt, manager } = terminalManager("waiting");
			handleDeferCommand({ send: vi.fn() }, manager, request);
			session.status = "done";

			finishWith({ output: "Approved.\n", exitCode: 0 });

			expect(typePrompt).not.toHaveBeenCalled();
			expect(session.pendingDeferredResults).toBeUndefined();
		});

		it("drops a queued decision when the session ends before going idle", () => {
			const { session, typePrompt, manager } = terminalManager("running");
			handleDeferCommand({ send: vi.fn() }, manager, request);
			finishWith({ output: "Approved.\n", exitCode: 0 });

			session.status = "done";
			flushDeferredResults(session, manager);

			expect(typePrompt).not.toHaveBeenCalled();
			expect(session.pendingDeferredResults).toBeUndefined();
		});
	});
});

describe("defer-command with a pending preview", () => {
	const wontfix = {
		...request,
		argv: ["prs", "wontfix", "11", "out of scope"],
		previewKey: "prs wontfix 11",
	};

	beforeEach(() => {
		mockRun.mockReset().mockReturnValue(123);
	});

	it("refuses another command's preview and keeps the pending one", () => {
		const sdk = { send: vi.fn() };
		const { sessions, manager } = managerWith(sdk);
		handleDeferCommand({ send: vi.fn() }, manager, wontfix);
		const client = { send: vi.fn() };

		handleDeferCommand(client, manager, {
			...request,
			argv: ["prs", "review-reply", "42", "-"],
			previewKey: "prs review-reply 42",
		});

		expect(mockRun).toHaveBeenCalledTimes(1);
		expect(replies(client)).toEqual([
			{
				type: "defer-command-result",
				accepted: false,
				pendingPreview: "prs wontfix 11",
			},
		]);
		expect(sessions.get("7")?.deferredCommands).toHaveLength(1);
		finishWith({ output: "Replied and resolved.\n", exitCode: 0 });
		expect(sdk.send).toHaveBeenCalledWith(
			expect.stringContaining("Replied and resolved."),
		);
	});

	it("refuses the same command for another target", () => {
		const { manager } = managerWith({ send: vi.fn() });
		handleDeferCommand({ send: vi.fn() }, manager, wontfix);
		const client = { send: vi.fn() };

		handleDeferCommand(client, manager, {
			...wontfix,
			argv: ["prs", "wontfix", "12", "dup"],
			previewKey: "prs wontfix 12",
		});

		expect(mockRun).toHaveBeenCalledTimes(1);
		expect(replies(client)[0].accepted).toBe(false);
	});

	it("refuses while a blocking preview from another command is open", () => {
		const { sessions, manager } = managerWith({ send: vi.fn() });
		const session = sessions.get("7") as Session;
		session.pendingPrPreview = { kind: "ask", title: "Plan" } as never;
		session.pendingPreviewKey = "ask";
		const client = { send: vi.fn() };

		handleDeferCommand(client, manager, wontfix);

		expect(mockRun).not.toHaveBeenCalled();
		expect(replies(client)[0]).toMatchObject({ pendingPreview: "ask" });
	});

	it("accepts the same command for the same target so it can supersede", () => {
		const { sessions, manager } = managerWith({ send: vi.fn() });
		handleDeferCommand({ send: vi.fn() }, manager, wontfix);
		const client = { send: vi.fn() };

		handleDeferCommand(client, manager, {
			...wontfix,
			argv: ["prs", "wontfix", "11", "revised reason"],
		});

		expect(mockRun).toHaveBeenCalledTimes(2);
		expect(replies(client)).toEqual([
			{ type: "defer-command-result", accepted: true },
		]);
		expect(sessions.get("7")?.deferredCommands).toHaveLength(2);
	});
});
