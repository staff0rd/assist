import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { findTranscriptPathSync } from "../shared/findTranscriptPathSync";
import { extractContextAfterReference } from "../summarise/extractContextAfterReference";
import { extractFirstUserMessage } from "../summarise/extractFirstUserMessage";
import { daemonLog } from "./daemonLog";
import { generateSessionTitle } from "./generateSessionTitle";
import { startTranscriptTitleGeneration } from "./startTranscriptTitleGeneration";
import type { Session } from "./types";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./generateSessionTitle", () => ({
	generateSessionTitle: vi.fn(async () => "Add dark mode"),
	SESSION_TITLE_MAX_LENGTH: 48,
}));
vi.mock("../summarise/extractFirstUserMessage", () => ({
	extractFirstUserMessage: vi.fn(() => "please add dark mode to settings"),
}));
vi.mock("../summarise/extractContextAfterReference", () => ({
	extractContextAfterReference: vi.fn(
		() => "saving a client record twice drops the contact email",
	),
}));
vi.mock("../shared/findTranscriptPathSync", () => ({
	findTranscriptPathSync: vi.fn(() => "/projects/repo/abc.jsonl"),
}));

const mockGenerate = generateSessionTitle as unknown as ReturnType<
	typeof vi.fn
>;
const mockLog = daemonLog as unknown as ReturnType<typeof vi.fn>;
const mockExtract = extractFirstUserMessage as unknown as ReturnType<
	typeof vi.fn
>;
const mockExtractContext =
	extractContextAfterReference as unknown as ReturnType<typeof vi.fn>;
const mockFindPath = findTranscriptPathSync as unknown as ReturnType<
	typeof vi.fn
>;

const transcriptSession = {
	id: "7",
	commandType: "claude",
	cwd: "/home/me/repo",
	claudeSessionId: "abc",
	transcriptPath: "/projects/repo/abc.jsonl",
} satisfies Partial<Session>;

async function flush(): Promise<void> {
	await new Promise((resolve) => setImmediate(resolve));
}

describe("startTranscriptTitleGeneration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGenerate.mockResolvedValue("Add dark mode");
		mockExtract.mockReturnValue("please add dark mode to settings");
		mockExtractContext.mockReturnValue(
			"saving a client record twice drops the contact email",
		);
		mockFindPath.mockReturnValue("/projects/repo/abc.jsonl");
	});

	it("titles a promptless session from its first transcript message", async () => {
		const session = makeSession(transcriptSession);
		const notify = vi.fn();

		startTranscriptTitleGeneration(session, notify);
		await flush();

		expect(mockGenerate).toHaveBeenCalledWith(
			"please add dark mode to settings",
		);
		expect(session.generatedTitle).toBe("Add dark mode");
		expect(notify).toHaveBeenCalledOnce();
		expect(mockLog).toHaveBeenCalledWith(
			"session 7 deriving title from first transcript message",
		);
		expect(mockLog).toHaveBeenCalledWith(
			"session 7 generated title: Add dark mode",
		);
	});

	it("generates once no matter how often the watcher fires", async () => {
		const session = makeSession(transcriptSession);
		const notify = vi.fn();

		startTranscriptTitleGeneration(session, notify);
		startTranscriptTitleGeneration(session, notify);
		startTranscriptTitleGeneration(session, notify);
		await flush();
		startTranscriptTitleGeneration(session, notify);
		await flush();

		expect(mockGenerate).toHaveBeenCalledOnce();
		expect(notify).toHaveBeenCalledOnce();
	});

	it("skips a session that already carries a generated title", () => {
		startTranscriptTitleGeneration(
			makeSession({ ...transcriptSession, generatedTitle: "Add dark mode" }),
			vi.fn(),
		);

		expect(mockGenerate).not.toHaveBeenCalled();
		expect(mockExtract).not.toHaveBeenCalled();
	});

	it("skips a session whose generation is already in flight", () => {
		startTranscriptTitleGeneration(
			makeSession({ ...transcriptSession, titleGenerationStarted: true }),
			vi.fn(),
		);

		expect(mockGenerate).not.toHaveBeenCalled();
		expect(mockExtract).not.toHaveBeenCalled();
	});

	it("leaves prompted sessions to the spawn-time path", () => {
		startTranscriptTitleGeneration(
			makeSession({
				...transcriptSession,
				initialPrompt: "the login page redirects",
			}),
			vi.fn(),
		);

		expect(mockGenerate).not.toHaveBeenCalled();
	});

	it.each([
		"https://github.com/apm-better-life/operational-support/issues/278",
		"look into https://github.com/apm-better-life/operational-support/issues/278 please",
	])(
		"titles a claude session prompted with a reference (%s) from the context after it",
		async (initialPrompt) => {
			const session = makeSession({ ...transcriptSession, initialPrompt });
			const notify = vi.fn();

			startTranscriptTitleGeneration(session, notify);
			await flush();

			expect(mockExtractContext).toHaveBeenCalledWith(
				"/projects/repo/abc.jsonl",
			);
			expect(mockExtract).not.toHaveBeenCalled();
			expect(mockGenerate).toHaveBeenCalledWith(
				"saving a client record twice drops the contact email",
			);
			expect(session.generatedTitle).toBe("Add dark mode");
			expect(notify).toHaveBeenCalledOnce();
		},
	);

	it("skips sessions that are not plain claude sessions", () => {
		startTranscriptTitleGeneration(
			makeSession({
				...transcriptSession,
				commandType: "run",
				runName: "build",
			}),
			vi.fn(),
		);

		expect(mockGenerate).not.toHaveBeenCalled();
	});

	it("stays retryable while the transcript has no user message yet", async () => {
		const session = makeSession(transcriptSession);
		mockExtract.mockReturnValueOnce(undefined);

		startTranscriptTitleGeneration(session, vi.fn());

		expect(mockGenerate).not.toHaveBeenCalled();
		expect(session.titleGenerationStarted).toBeUndefined();

		startTranscriptTitleGeneration(session, vi.fn());
		await flush();

		expect(mockGenerate).toHaveBeenCalledOnce();
		expect(session.generatedTitle).toBe("Add dark mode");
	});

	it("falls back to locating the transcript when the path is unresolved", async () => {
		startTranscriptTitleGeneration(
			makeSession({ ...transcriptSession, transcriptPath: undefined }),
			vi.fn(),
		);
		await flush();

		expect(mockFindPath).toHaveBeenCalledWith("/home/me/repo", "abc");
		expect(mockExtract).toHaveBeenCalledWith("/projects/repo/abc.jsonl");
	});

	it("keeps the Session placeholder when generation fails", async () => {
		mockGenerate.mockResolvedValue(undefined);
		const session = makeSession(transcriptSession);
		const notify = vi.fn();

		startTranscriptTitleGeneration(session, notify);
		await flush();

		expect(session.generatedTitle).toBeUndefined();
		expect(notify).not.toHaveBeenCalled();
		expect(mockLog).toHaveBeenCalledWith(
			"session 7 title generation failed; keeping placeholder title",
		);
	});

	it("stays retryable while no transcript exists on disk", () => {
		const session = makeSession({
			...transcriptSession,
			transcriptPath: undefined,
		});
		mockFindPath.mockReturnValue(null);

		startTranscriptTitleGeneration(session, vi.fn());

		expect(mockExtract).not.toHaveBeenCalled();
		expect(session.titleGenerationStarted).toBeUndefined();
	});

	describe("assist card whose prompt was a reference", () => {
		function referenceCard(overrides: Partial<Session> = {}): Session {
			return makeSession({
				...transcriptSession,
				commandType: "assist",
				assistArgs: [
					"bug",
					"--once",
					"https://centium.atlassian.net/browse/PA-556",
				],
				...overrides,
			});
		}

		it("titles the card from the context that follows the reference", async () => {
			const session = referenceCard();
			const notify = vi.fn();

			startTranscriptTitleGeneration(session, notify);
			await flush();

			expect(mockExtractContext).toHaveBeenCalledWith(
				"/projects/repo/abc.jsonl",
			);
			expect(mockExtract).not.toHaveBeenCalled();
			expect(mockGenerate).toHaveBeenCalledWith(
				"saving a client record twice drops the contact email",
			);
			expect(session.generatedTitle).toBe("Add dark mode");
			expect(notify).toHaveBeenCalledOnce();
			expect(mockLog).toHaveBeenCalledWith(
				"session 7 deriving title from transcript context after the reference",
			);
		});

		it("generates nothing while the transcript holds only the reference", () => {
			const session = referenceCard();
			mockExtractContext.mockReturnValue(undefined);

			startTranscriptTitleGeneration(session, vi.fn());

			expect(mockGenerate).not.toHaveBeenCalled();
			expect(session.titleGenerationStarted).toBeUndefined();
		});

		it("generates exactly once as the context arrives", async () => {
			const session = referenceCard();
			const notify = vi.fn();
			mockExtractContext.mockReturnValueOnce(undefined);

			startTranscriptTitleGeneration(session, notify);
			expect(mockGenerate).not.toHaveBeenCalled();

			startTranscriptTitleGeneration(session, notify);
			startTranscriptTitleGeneration(session, notify);
			await flush();
			startTranscriptTitleGeneration(session, notify);
			await flush();

			expect(mockGenerate).toHaveBeenCalledOnce();
			expect(notify).toHaveBeenCalledOnce();
			expect(session.generatedTitle).toBe("Add dark mode");
		});

		it("leaves a card with a real prompt to the spawn-time path", () => {
			startTranscriptTitleGeneration(
				referenceCard({
					assistArgs: ["bug", "--once", "saving a client loses the email"],
				}),
				vi.fn(),
			);

			expect(mockGenerate).not.toHaveBeenCalled();
			expect(mockExtractContext).not.toHaveBeenCalled();
		});

		it("leaves a card that already has its backlog item name alone", () => {
			startTranscriptTitleGeneration(
				referenceCard({
					activity: {
						kind: "command",
						name: "bug",
						itemId: 556,
						itemName: "Saving a client drops the contact email",
						startedAt: 0,
					},
				}),
				vi.fn(),
			);

			expect(mockGenerate).not.toHaveBeenCalled();
			expect(mockExtractContext).not.toHaveBeenCalled();
		});

		it("ignores an assist card that is not a draft command", () => {
			startTranscriptTitleGeneration(
				referenceCard({
					assistArgs: [
						"next",
						"--once",
						"https://centium.atlassian.net/browse/PA-556",
					],
				}),
				vi.fn(),
			);

			expect(mockGenerate).not.toHaveBeenCalled();
			expect(mockExtractContext).not.toHaveBeenCalled();
		});
	});
});
