import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as harnessAdapterModule from "../../../shared/harnessAdapters/harnessAdapter";
import type { HarnessKind } from "../../../shared/harnesses";
import { fakeHarnessMock } from "../../../test/mocks/fakeHarnessMock";
import { makeSession } from "../../../test/mothers/makeSession";
import {
	readTranscriptTail,
	readTranscriptTailSync,
} from "../shared/readTranscriptTail";
import { readTranscriptHead } from "../summarise/readTranscriptHead";
import { bindConversation } from "./bindConversation";
import { deriveRestoreStatus } from "./deriveRestoreStatus";
import { generateSessionTitle } from "./generateSessionTitle";
import { reconcileTranscriptStatus } from "./reconcileTranscriptStatus";
import { startTranscriptTitleGeneration } from "./startTranscriptTitleGeneration";
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
	readTranscriptTailSync: vi.fn(),
}));
vi.mock("../summarise/readTranscriptHead", () => ({
	readTranscriptHead: vi.fn(),
}));
vi.mock("./generateSessionTitle", () => ({
	generateSessionTitle: vi.fn(async () => "Fake title"),
}));
vi.mock("./rememberSessionTitle", () => ({ rememberSessionTitle: vi.fn() }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const tail = vi.mocked(readTranscriptTail);
const tailSync = vi.mocked(readTranscriptTailSync);
const head = vi.mocked(readTranscriptHead);

type Line = Record<string, unknown>;
const lines: Line[] = [];
const say = (who: "user" | "agent", text: string): Line => ({
	seq: String(lines.length + 1),
	say: who,
	text,
});
function append(...added: Line[]) {
	for (const line of added)
		lines.push({ ...line, seq: String(lines.length + 1) });
	tail.mockResolvedValue([...lines]);
	tailSync.mockReturnValue([...lines]);
	head.mockReturnValue(lines.map((line) => JSON.stringify(line)).join("\n"));
}

function fakeSession(overrides: Partial<Session> = {}): Session {
	return makeSession({
		id: "f1",
		commandType: "claude",
		harness: FAKE,
		cwd: "/repo",
		harnessSessionId: "conv-1",
		...overrides,
	});
}

async function flush() {
	await new Promise((resolve) => setImmediate(resolve));
}

describe("shared conversation consumers on fake harness events", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		lines.length = 0;
		append();
	});

	it("follows a growing transcript: previews, then status as turns start and end", async () => {
		const session = fakeSession({ status: "waiting" });
		const onStatusChange = vi.fn((s: Session, status: Session["status"]) => {
			s.status = status;
		});
		const notify = vi.fn();

		append({ turn: "start" }, say("user", "add dark mode"));
		await reconcileTranscriptStatus(session, onStatusChange, notify);
		expect(session.lastUserMessage).toBe("add dark mode");
		expect(session.status).toBe("running");

		append(say("agent", "Done."), { turn: "end" });
		await reconcileTranscriptStatus(session, onStatusChange, notify);
		expect(session.lastAssistantMessage).toBe("Done.");
		expect(session.status).toBe("waiting");
		expect(session.transcriptPath).toBe("/fake/conv-1.log");
		expect(session.claudeSessionId).toBeUndefined();
	});

	it("skips re-deriving while the transcript has not advanced", async () => {
		const session = fakeSession();
		const onStatusChange = vi.fn();
		append({ turn: "end" });

		await reconcileTranscriptStatus(session, onStatusChange);
		await reconcileTranscriptStatus(session, onStatusChange);

		expect(onStatusChange).toHaveBeenCalledOnce();
	});

	it("restores status after a daemon restart from the reader's lifecycle", () => {
		const persisted = {
			name: "repo/fake",
			commandType: "claude" as const,
			cwd: "/repo",
			startedAt: 1,
			harness: FAKE,
			harnessSessionId: "conv-1",
		};
		append({ turn: "start" }, say("user", "go"));
		expect(deriveRestoreStatus(persisted)).toBe("running");
		append({ turn: "end" }, { use: "ask", input: { questions: "[]" } });
		expect(deriveRestoreStatus(persisted)).toBe("asking");
		expect(
			deriveRestoreStatus({ ...persisted, harnessSessionId: undefined }),
		).toBe("waiting");
	});

	it("titles a blank session from its first user message", async () => {
		const session = fakeSession();
		append(say("user", "please add dark mode"), say("agent", "ok"));

		startTranscriptTitleGeneration(session, vi.fn());
		await flush();

		expect(generateSessionTitle).toHaveBeenCalledWith(
			"please add dark mode",
			FAKE,
		);
		expect(session.generatedTitle).toBe("Fake title");
	});

	it("keeps a blank session retryable while its transcript has no prompt", () => {
		const session = fakeSession();
		append({ turn: "start" });

		startTranscriptTitleGeneration(session, vi.fn());

		expect(generateSessionTitle).not.toHaveBeenCalled();
		expect(session.titleGenerationStarted).toBeUndefined();
	});

	it("titles a reference-prompted session from the context after the reference", async () => {
		const session = fakeSession({ initialPrompt: "a1545" });
		append(say("user", "a1545"));
		startTranscriptTitleGeneration(session, vi.fn());
		expect(generateSessionTitle).not.toHaveBeenCalled();

		const body =
			"Saving a client record twice silently drops the contact email; the fix belongs in the save handler.";
		append(
			{ result: body },
			say("agent", "I will file that against the save handler."),
		);
		startTranscriptTitleGeneration(session, vi.fn());
		await flush();

		const context = vi.mocked(generateSessionTitle).mock.calls[0][0];
		expect(context).toContain(body);
		expect(context).not.toContain("a1545");
	});
});

describe("late binding through the adapter's discovery", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => {
		vi.useRealTimers();
		delete process.env.FAKE_HARNESS_CONVERSATION_ID;
	});

	it("binds the discovered id as harnessSessionId and rewatches, never a claude id", async () => {
		process.env.FAKE_HARNESS_CONVERSATION_ID = "conv-9";
		const session = fakeSession({ harnessSessionId: undefined });
		const onBound = vi.fn();
		const notify = vi.fn();

		bindConversation(session, notify, 0, onBound);
		await vi.advanceTimersByTimeAsync(1000);

		expect(session.harnessSessionId).toBe("conv-9");
		expect(session.claudeSessionId).toBeUndefined();
		expect(onBound).toHaveBeenCalledWith(session);
		expect(notify).toHaveBeenCalled();
	});

	it("keeps polling until the conversation appears", async () => {
		const session = fakeSession({ harnessSessionId: undefined });
		bindConversation(session, vi.fn(), 0);
		await vi.advanceTimersByTimeAsync(3000);
		expect(session.harnessSessionId).toBeUndefined();

		process.env.FAKE_HARNESS_CONVERSATION_ID = "late";
		await vi.advanceTimersByTimeAsync(1000);
		expect(session.harnessSessionId).toBe("late");
	});

	it("does not poll for a harness that preassigns its ids", async () => {
		const session = makeSession({ cwd: "/repo" });
		bindConversation(session, vi.fn(), 0);
		await vi.advanceTimersByTimeAsync(5000);
		expect(session.harnessSessionId).toBeUndefined();
		expect(session.claudeSessionId).toBeUndefined();
	});
});
