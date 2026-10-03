import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { daemonLog } from "./daemonLog";
import { generateSessionTitle } from "./generateSessionTitle";
import { startSessionTitleGeneration } from "./startSessionTitleGeneration";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./generateSessionTitle", () => ({
	generateSessionTitle: vi.fn(async () => "Fix login redirect"),
	SESSION_TITLE_MAX_LENGTH: 48,
}));

const mockGenerate = generateSessionTitle as unknown as ReturnType<
	typeof vi.fn
>;
const mockLog = daemonLog as unknown as ReturnType<typeof vi.fn>;

async function flush(): Promise<void> {
	await new Promise((resolve) => setImmediate(resolve));
}

describe("startSessionTitleGeneration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGenerate.mockResolvedValue("Fix login redirect");
	});

	it("assigns, logs and broadcasts a title for a prompted claude session", async () => {
		const session = makeSession({
			id: "7",
			commandType: "claude",
			initialPrompt: "the login page redirects",
		});
		const notify = vi.fn();

		startSessionTitleGeneration(session, notify);
		await flush();

		expect(mockGenerate).toHaveBeenCalledWith("the login page redirects");
		expect(session.generatedTitle).toBe("Fix login redirect");
		expect(notify).toHaveBeenCalledOnce();
		expect(mockLog).toHaveBeenCalledWith(
			"session 7 generated title: Fix login redirect",
		);
	});

	it("returns before spawning anything for a promptless session", () => {
		const notify = vi.fn();

		startSessionTitleGeneration(
			makeSession({ id: "7", commandType: "claude" }),
			notify,
		);

		expect(mockGenerate).not.toHaveBeenCalled();
		expect(notify).not.toHaveBeenCalled();
	});

	it("summarises the prompt text of a draft card", async () => {
		const session = makeSession({
			id: "7",
			commandType: "assist",
			assistArgs: ["draft", "--once", "add dark mode to the settings page"],
		});

		startSessionTitleGeneration(session, vi.fn());
		await flush();

		expect(mockGenerate).toHaveBeenCalledWith(
			"add dark mode to the settings page",
		);
	});

	it("skips a draft card launched without prompt text", () => {
		startSessionTitleGeneration(
			makeSession({
				id: "7",
				commandType: "assist",
				assistArgs: ["draft", "--once"],
			}),
			vi.fn(),
		);

		expect(mockGenerate).not.toHaveBeenCalled();
	});

	it("skips a refine card whose only arg is a backlog item id", () => {
		startSessionTitleGeneration(
			makeSession({
				id: "7",
				commandType: "assist",
				assistArgs: ["refine", "--once", "254"],
			}),
			vi.fn(),
		);

		expect(mockGenerate).not.toHaveBeenCalled();
	});

	it("defers titling a bug card whose whole prompt is a tracker reference", () => {
		const session = makeSession({
			id: "7",
			commandType: "assist",
			assistArgs: [
				"bug",
				"--once",
				"https://centium.atlassian.net/browse/PA-556",
			],
		});
		const notify = vi.fn();

		startSessionTitleGeneration(session, notify);

		expect(mockGenerate).not.toHaveBeenCalled();
		expect(session.titleGenerationStarted).toBeUndefined();
		expect(notify).not.toHaveBeenCalled();
		expect(mockLog).toHaveBeenCalledWith(
			"session 7 title deferred pending context: prompt is a reference (https://centium.atlassian.net/browse/PA-556)",
		);
	});

	it("defers titling a claude session whose whole prompt is a bare issue key", () => {
		const session = makeSession({
			id: "7",
			commandType: "claude",
			initialPrompt: "PA-556",
		});

		startSessionTitleGeneration(session, vi.fn());

		expect(mockGenerate).not.toHaveBeenCalled();
		expect(session.titleGenerationStarted).toBeUndefined();
	});

	it("defers titling a prompt that wraps a tracker url in prose", () => {
		const session = makeSession({
			id: "7",
			commandType: "claude",
			initialPrompt:
				"have a look at https://centium.atlassian.net/browse/PA-556",
		});

		startSessionTitleGeneration(session, vi.fn());

		expect(mockGenerate).not.toHaveBeenCalled();
		expect(session.titleGenerationStarted).toBeUndefined();
	});

	it("still titles a prompt that mixes a reference with real text", async () => {
		const session = makeSession({
			id: "7",
			commandType: "assist",
			assistArgs: ["bug", "--once", "PA-556 is failing on save"],
		});

		startSessionTitleGeneration(session, vi.fn());
		await flush();

		expect(mockGenerate).toHaveBeenCalledWith("PA-556 is failing on save");
		expect(session.generatedTitle).toBe("Fix login redirect");
	});

	it("skips assist commands outside draft, bug and refine", () => {
		startSessionTitleGeneration(
			makeSession({
				id: "7",
				commandType: "assist",
				assistArgs: ["next", "--once", "some text"],
			}),
			vi.fn(),
		);

		expect(mockGenerate).not.toHaveBeenCalled();
	});

	it("skips run sessions", () => {
		startSessionTitleGeneration(
			makeSession({ id: "7", commandType: "run", runName: "build" }),
			vi.fn(),
		);

		expect(mockGenerate).not.toHaveBeenCalled();
	});

	it("skips a session that already carries a generated title", () => {
		startSessionTitleGeneration(
			makeSession({
				id: "7",
				commandType: "claude",
				initialPrompt: "the login page redirects",
				generatedTitle: "Fix login redirect",
			}),
			vi.fn(),
		);

		expect(mockGenerate).not.toHaveBeenCalled();
	});

	it("falls back to a single line of the prompt when generation fails", async () => {
		mockGenerate.mockResolvedValue(undefined);
		const session = makeSession({
			id: "7",
			commandType: "claude",
			initialPrompt: "the login page\nredirects  badly",
		});
		const notify = vi.fn();

		startSessionTitleGeneration(session, notify);
		await flush();

		expect(session.generatedTitle).toBe("the login page redirects badly");
		expect(notify).toHaveBeenCalledOnce();
		expect(mockLog).toHaveBeenCalledWith(
			'session 7 title generation failed; falling back to "the login page redirects badly"',
		);
	});

	it("caps the fallback so a failed card never wraps", async () => {
		mockGenerate.mockResolvedValue(undefined);
		const session = makeSession({
			id: "7",
			commandType: "claude",
			initialPrompt: "a ".repeat(200),
		});

		startSessionTitleGeneration(session, vi.fn());
		await flush();

		expect(session.generatedTitle).toHaveLength(48);
	});

	it("does not throw when generation rejects", async () => {
		mockGenerate.mockRejectedValue(new Error("boom"));
		const session = makeSession({
			id: "7",
			commandType: "claude",
			initialPrompt: "the login page redirects",
		});

		startSessionTitleGeneration(session, vi.fn());
		await flush();

		expect(session.generatedTitle).toBeUndefined();
		expect(mockLog).toHaveBeenCalledWith(
			"session 7 title generation errored: Error: boom",
		);
	});
});
