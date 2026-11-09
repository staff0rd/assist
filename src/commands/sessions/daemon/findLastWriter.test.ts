import type { IPty } from "node-pty";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as harnessAdapterModule from "../../../shared/harnessAdapters/harnessAdapter";
import type { HarnessKind } from "../../../shared/harnesses";
import { fakeHarnessMock } from "../../../test/mocks/fakeHarnessMock";
import { makeSession } from "../../../test/mothers/makeSession";
import { readTranscriptTail } from "../shared/readTranscriptTail";
import { findLastWriter } from "./findLastWriter";
import type { Session } from "./types";

const fake = fakeHarnessMock();
const FAKE = "fake" as HarnessKind;

vi.mock("../../../shared/harnessAdapters/harnessAdapter", async (original) => {
	const actual = await original<typeof harnessAdapterModule>();
	return {
		harnessAdapter: (kind: HarnessKind | undefined) =>
			(kind as string) === "fake" ? fake : actual.harnessAdapter(kind),
	};
});
vi.mock("../shared/readTranscriptTail", () => ({
	readTranscriptTail: vi.fn(),
}));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const target = { file: "docs/guide/pages/start.json", within: "docs/guide/" };
const transcripts = new Map<string, Record<string, unknown>[]>();

function live(fields: Partial<Session>): Session {
	return makeSession({ pty: {} as IPty, cwd: "/r", ...fields });
}

function claudeWrite(at: string, file: string) {
	return {
		type: "assistant",
		timestamp: at,
		message: {
			content: [{ type: "tool_use", name: "Edit", input: { file_path: file } }],
		},
	};
}

function codexWrite(at: string, file: string) {
	return {
		timestamp: at,
		type: "event_msg",
		payload: {
			type: "item_completed",
			item: { type: "FileChange", changes: { [file]: { type: "update" } } },
		},
	};
}

describe("findLastWriter", () => {
	beforeEach(() => {
		transcripts.clear();
		vi.mocked(readTranscriptTail).mockImplementation(async (path) =>
			structuredClone(transcripts.get(path) ?? []),
		);
	});

	it("picks the newest writer across concurrent Claude, Codex and fake sessions", async () => {
		transcripts.set("/t/claude.jsonl", [
			claudeWrite("2026-10-25T01:00:00Z", "/r/docs/guide/pages/start.json"),
		]);
		transcripts.set("/t/codex.jsonl", [
			codexWrite("2026-10-25T03:00:00Z", "/r/docs/guide/pages/start.json"),
		]);
		transcripts.set("/fake/f-1.log", [
			{
				use: "save",
				input: { file: "docs/guide/x.css" },
				at: "2026-10-25T05:00:00Z",
			},
		]);
		const sessions = [
			live({
				id: "c",
				claudeSessionId: "c-1",
				transcriptPath: "/t/claude.jsonl",
			}),
			live({
				id: "x",
				harness: "codex",
				harnessSessionId: "x-1",
				transcriptPath: "/t/codex.jsonl",
			}),
			live({ id: "f", harness: FAKE, harnessSessionId: "f-1" }),
		];

		expect(await findLastWriter(sessions, target)).toBe("x");
		expect(
			await findLastWriter(sessions, { ...target, file: "docs/none.json" }),
		).toBe("f");
	});

	it("skips sessions whose conversation is unbound or unreadable", async () => {
		transcripts.set("/t/claude.jsonl", [
			claudeWrite("2026-10-25T01:00:00Z", "/r/docs/guide/pages/start.json"),
		]);
		const sessions = [
			live({
				id: "c",
				claudeSessionId: "c-1",
				transcriptPath: "/t/claude.jsonl",
			}),
			live({ id: "x", harness: "codex" }),
			live({ id: "p", harness: "pi", harnessSessionId: "p-1" }),
		];

		expect(await findLastWriter(sessions, target)).toBe("c");
	});

	it("finds no writer when no live session wrote the target", async () => {
		const sessions = [
			live({ id: "c", claudeSessionId: "c-1", transcriptPath: "/t/none" }),
		];

		expect(await findLastWriter(sessions, target)).toBeUndefined();
	});
});
