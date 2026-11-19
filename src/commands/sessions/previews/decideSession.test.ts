import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { formatAskQuestionAnswers } from "../../askQuestion/formatAskQuestionAnswers";
import type { SessionClient } from "../daemon/broadcast";
import { PrPreviewCoordinator } from "../daemon/PrPreviewCoordinator";
import { sendToDaemon } from "../daemon/sendToDaemon";
import type { AskQuestion } from "../shared/askQuestionInputSchema";
import { decideSession } from "./decideSession";
import { findDaemonSession } from "./findDaemonSession";

vi.mock("./findDaemonSession", () => ({ findDaemonSession: vi.fn() }));
vi.mock("../daemon/sendToDaemon", () => ({ sendToDaemon: vi.fn() }));

const questions: AskQuestion[] = [
	{
		question: "Which database?",
		header: "DB",
		multiSelect: false,
		options: [
			{ label: "Postgres", description: "" },
			{ label: "SQLite", description: "" },
		],
	},
];

function waitingSession(
	kind: string,
	body: string,
	id = "7",
): {
	coord: PrPreviewCoordinator;
	waiter: { sent: Record<string, unknown>[] };
} {
	const session = makeSession({ id });
	const coord = new PrPreviewCoordinator(new Map([[id, session]]), vi.fn());
	const sent: Record<string, unknown>[] = [];
	const waiter: SessionClient = {
		send: (data: string) => sent.push(JSON.parse(data)),
	};
	coord.set(waiter, {
		type: "pr-preview",
		sessionId: id,
		requestId: "r1",
		title: "Pick",
		body,
		prNumber: null,
		kind,
	});
	vi.mocked(findDaemonSession).mockResolvedValue(session);
	vi.mocked(sendToDaemon).mockImplementation(async (message) =>
		coord.decide(message),
	);
	return { coord, waiter: { sent } };
}

describe("decideSession", () => {
	beforeEach(() => {
		vi.spyOn(console, "log").mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
		process.exitCode = undefined;
	});

	it("answers a waiting ask-question form", async () => {
		const { waiter } = waitingSession(
			"question",
			JSON.stringify({ questions }),
		);

		await decideSession("7", { answer: ["sqlite"] });

		const reply = waiter.sent.at(-1);
		expect(reply).toMatchObject({
			type: "pr-decision",
			requestId: "r1",
			decision: "approve",
		});
		expect(
			formatAskQuestionAnswers(
				questions,
				reply?.answers as Record<string, string>,
			),
		).toContain('"Which database?"="SQLite"');
		expect(process.exitCode).toBeUndefined();
	});

	it("rejects a waiting ask with the note as its reason", async () => {
		const { waiter } = waitingSession("ask", "plan", "win:3");

		await decideSession("win:3", { reject: "too broad" });

		expect(vi.mocked(sendToDaemon)).toHaveBeenCalledWith(
			expect.objectContaining({ sessionId: "win:3", requestId: "r1" }),
		);
		expect(waiter.sent.at(-1)).toMatchObject({
			decision: "reject",
			reason: "too broad",
		});
	});

	it("errors when the session has no pending preview", async () => {
		vi.mocked(findDaemonSession).mockResolvedValue(makeSession({ id: "7" }));

		await decideSession("7", { approve: true });

		expect(console.error).toHaveBeenCalledWith(
			"Session 7 has no pending preview to decide",
		);
		expect(sendToDaemon).not.toHaveBeenCalled();
		expect(process.exitCode).toBe(1);
	});

	it.each([
		"No sessions daemon is running",
		"No session 9. Known ids (see assist sessions list): 7",
	])("reports %s and exits 1", async (message) => {
		vi.mocked(findDaemonSession).mockRejectedValue(new Error(message));

		await decideSession("9", { approve: true });

		expect(console.error).toHaveBeenCalledWith(message);
		expect(process.exitCode).toBe(1);
	});
});
