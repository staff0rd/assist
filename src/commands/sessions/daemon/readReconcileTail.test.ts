import { appendFileSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { applySdkTaskList } from "./applySdkTaskList";
import type { Session } from "./createSession";
import { reconcileTranscriptStatus } from "./reconcileTranscriptStatus";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const conversationId = "f82f9550-5074-4b41-a13a-fcd9e15bf038";
const blob = "x".repeat(120 * 1024);

const user = (content: string) => ({ type: "user", message: { content } });
const reply = (text: string) => ({
	type: "assistant",
	message: { stop_reason: "end_turn", content: [{ type: "text", text }] },
});
const requestRows = () =>
	[1, 2, 3].map(() => ({
		type: "api-request-blob",
		message: { role: "user", content: [{ type: "text", text: blob }] },
	}));

let dir: string;
let filePath: string;
let session: Session;

const write = (...rows: object[]) =>
	appendFileSync(
		filePath,
		rows.map((row) => `${JSON.stringify(row)}\n`).join(""),
	);

async function send(text: string, rows: object[]) {
	applySdkTaskList(session, { kind: "pending", texts: [text] });
	write(...rows);
	await reconcileTranscriptStatus(session, vi.fn());
}

describe("readReconcileTail after /clear", () => {
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "reconcile-tail-"));
		filePath = join(dir, `${conversationId}.jsonl`);
		writeFileSync(filePath, "");
		session = makeSession({
			id: "6",
			status: "waiting",
			claudeSessionId: conversationId,
			transcriptPath: filePath,
			transcriptPathKey: `claude:${conversationId}`,
		});
	});

	afterEach(() => rmSync(dir, { recursive: true, force: true }));

	it("clears each pending message when a slash command follows /clear", async () => {
		await send("/clear ", [
			user(
				"<command-name>/clear</command-name>\n<command-message>clear</command-message>\n<command-args></command-args>",
			),
		]);
		expect(session.sdkPending).toBeUndefined();

		await send("/review-ci-risk ", [
			user(
				"<command-message>review-ci-risk</command-message>\n<command-name>/review-ci-risk</command-name>",
			),
			...requestRows(),
		]);
		expect(session.sdkPending).toBeUndefined();

		write(reply("checklist"));
		await send("a test", [user("a test"), ...requestRows(), reply("ok")]);
		expect(session.sdkPending).toBeUndefined();
	});

	it("drops an older pending entry stuck before a later recorded message", async () => {
		session.sdkPending = ["/review-ci-risk "];
		await send("a test", [user("a test"), reply("ok")]);
		expect(session.sdkPending).toBeUndefined();
	});
});
