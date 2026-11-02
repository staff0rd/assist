import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockRequestPreviewDecision = vi.fn();
const mockReadStdin = vi.fn();
const mockLoadConfig = vi.fn();
const mockIsLive = vi.fn();

vi.mock("./sessions/shared/isLiveDaemonSession", () => ({
	isLiveDaemonSession: (id: string) => mockIsLive(id),
}));

vi.mock("./sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (request: unknown) =>
		mockRequestPreviewDecision(request),
}));

vi.mock("./backlog/import/readStdinBuffer", () => ({
	readStdinBuffer: () => mockReadStdin(),
}));

vi.mock("../shared/loadConfig", () => ({
	loadConfig: () => mockLoadConfig(),
}));

const mockLoadItem = vi.fn();
const mockMoveManualCheck = vi.fn();

vi.mock("./backlog/shared", () => ({
	getReady: async () => ({ orm: "orm" }),
}));

vi.mock("./backlog/loadItem", () => ({
	loadItem: (_orm: unknown, id: number) => mockLoadItem(id),
}));

vi.mock("./backlog/moveManualCheck", () => ({
	moveManualCheck: (...args: unknown[]) => mockMoveManualCheck(...args),
}));

import { askCheck } from "./askCheck";

const check = {
	title: "PIN shows on the Mac",
	before: ["Restart both daemons"],
	steps: ["Run `assist docs unlock`", "The PIN appears on the Mac"],
	changed: "The docs PIN goes to the controlling node.",
};

function stdin(value: unknown) {
	mockReadStdin.mockResolvedValue(Buffer.from(JSON.stringify(value)));
}

describe("askCheck", () => {
	let logged: string[];
	let errored: string[];

	beforeEach(() => {
		vi.clearAllMocks();
		logged = [];
		errored = [];
		vi.spyOn(console, "log").mockImplementation((message: string) => {
			logged.push(message);
		});
		vi.spyOn(console, "error").mockImplementation((message: string) => {
			errored.push(message);
		});
		vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
			throw new Error(`process.exit(${code})`);
		}) as never);
		vi.stubEnv("ASSIST_SESSION", "1");
		vi.stubEnv("ASSIST_SESSION_ID", "s1");
		mockLoadConfig.mockReturnValue({ sessions: { askQuestion: true } });
		mockIsLive.mockResolvedValue(true);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("rejects a check with no steps before opening the pane", async () => {
		stdin({ title: "x", steps: [] });

		await expect(askCheck({ json: "-" })).rejects.toThrow("process.exit(1)");
		expect(errored.join("\n")).toContain("at least 1 step");
		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
	});

	it("names every over-limit field before any session check", async () => {
		vi.stubEnv("ASSIST_SESSION", "");
		stdin({
			title: "t".repeat(61),
			steps: ["s", "s", "s", "s".repeat(91), "s"],
			before: ["a", "b", "c", "d", "e"],
			changed: "c".repeat(161),
		});

		await expect(askCheck({ json: "-" })).rejects.toThrow("process.exit(1)");
		expect(errored.join("\n")).toBe(
			[
				"Error: the check is over its limits:",
				"- title: 61 characters (max 60)",
				"- steps: 5 items (max 4)",
				"- steps[4]: 91 characters (max 90)",
				"- before: 5 items (max 4)",
				"- changed: 161 characters (max 160)",
				"Shorten these fields and re-run assist ask-check.",
			].join("\n"),
		);
		expect(mockIsLive).not.toHaveBeenCalled();
	});

	it("accepts a check exactly at every limit", async () => {
		stdin({
			title: "t".repeat(60),
			steps: Array.from({ length: 4 }, () => "s".repeat(90)),
			before: ["a", "b", "c", "d"],
			changed: "c".repeat(160),
		});
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "approve",
			answers: { result: "works" },
		});

		await askCheck({ json: "-" });

		expect(mockRequestPreviewDecision).toHaveBeenCalled();
	});

	it.each([
		[
			"outside a session",
			() => vi.stubEnv("ASSIST_SESSION", ""),
			"not running in an assist session",
		],
		[
			"when disabled",
			() => mockLoadConfig.mockReturnValue({}),
			"sessions.askQuestion",
		],
		[
			"when the daemon does not know the session",
			() => mockIsLive.mockResolvedValue(false),
			"not live",
		],
	])("tells Claude to ask in chat %s", async (_, arrange, message) => {
		arrange();
		stdin(check);

		await expect(askCheck({ json: "-" })).rejects.toThrow("process.exit(1)");
		expect(errored.join("\n")).toContain(message);
		expect(errored.join("\n")).toContain("in chat");
		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
	});

	it("sends a check preview and prints the result with the note", async () => {
		stdin(check);
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "approve",
			answers: { result: "doesn't work", note: "PIN showed on work-wsl" },
		});

		await askCheck({ json: "-" });

		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				sessionId: "s1",
				kind: "check",
				title: check.title,
			}),
		);
		expect(
			JSON.parse(mockRequestPreviewDecision.mock.calls[0][0].body),
		).toEqual(check);
		expect(logged.at(-1)).toBe(
			'Manual check "PIN shows on the Mac": doesn\'t work\nNote: PIN showed on work-wsl',
		);
	});

	it("prints only the result when no note is given", async () => {
		stdin(check);
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "approve",
			answers: { result: "works" },
		});

		await askCheck({ json: "-" });

		expect(logged.at(-1)).toBe('Manual check "PIN shows on the Mac": works');
	});

	describe("--check", () => {
		const backlogItem = {
			id: 7,
			name: "Item",
			currentPhase: 1,
			acceptanceCriteria: [],
			plan: [
				{ name: "Build", tasks: [], manualChecks: ["first", "second"] },
				{ name: "Polish", tasks: [] },
			],
		};
		const laterPhases = [
			{ number: 2, name: "Polish" },
			{ number: 3, name: "Review" },
		];

		function sentBody() {
			return JSON.parse(mockRequestPreviewDecision.mock.calls[0][0].body);
		}

		beforeEach(() => {
			vi.stubEnv("ASSIST_BACKLOG_ITEM_ID", "7");
			mockLoadItem.mockResolvedValue(backlogItem);
			stdin(check);
		});

		it("lists every later phase, including Review, in the preview body", async () => {
			mockRequestPreviewDecision.mockResolvedValue({
				decision: "approve",
				answers: { result: "works" },
			});

			await askCheck({ json: "-", check: "2" });

			expect(sentBody()).toEqual({ ...check, laterPhases });
			expect(logged.at(-1)).toBe('Manual check "PIN shows on the Mac": works');
		});

		it("moves the check to the chosen phase on a later answer", async () => {
			mockRequestPreviewDecision.mockResolvedValue({
				decision: "approve",
				answers: { result: "later", phase: "3" },
			});

			await askCheck({ json: "-", check: "2" });

			expect(mockMoveManualCheck).toHaveBeenCalledWith(
				"orm",
				backlogItem,
				0,
				1,
				2,
			);
			expect(logged.at(-1)).toBe(
				'Manual check "PIN shows on the Mac": moved to phase 3 (Review)',
			);
		});

		it.each([
			["--check is omitted", () => {}, undefined],
			[
				"there is no backlog item",
				() => vi.stubEnv("ASSIST_BACKLOG_ITEM_ID", ""),
				"1",
			],
			[
				"the current phase is the last",
				() =>
					mockLoadItem.mockResolvedValue({ ...backlogItem, currentPhase: 3 }),
				"1",
			],
		])("sends no later phases when %s", async (_, arrange, index) => {
			arrange();
			mockRequestPreviewDecision.mockResolvedValue({
				decision: "approve",
				answers: { result: "works" },
			});

			await askCheck({ json: "-", check: index });

			expect(sentBody()).toEqual(check);
		});

		it("rejects an index past the phase's manual checks before opening", async () => {
			await expect(askCheck({ json: "-", check: "3" })).rejects.toThrow(
				"process.exit(1)",
			);
			expect(errored.join("\n")).toContain("--check 3 matches none");
			expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		});
	});

	it("exits non-zero when the user dismisses the check", async () => {
		stdin(check);
		mockRequestPreviewDecision.mockResolvedValue({ decision: "reject" });

		await expect(askCheck({ json: "-" })).rejects.toThrow("process.exit(1)");
		expect(errored.join("\n")).toContain("dismissed the manual check");
	});
});
