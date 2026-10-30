import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockRequestPreviewDecision = vi.fn();
const mockReadStdin = vi.fn();
const mockLoadConfig = vi.fn();

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

import { askQuestion } from "./askQuestion";

const questions = [
	{
		question: "Which layout?",
		header: "Layout",
		multiSelect: false,
		options: [
			{ label: "Compact", description: "One line each", preview: "● a" },
			{ label: "Grouped", description: "By repo" },
		],
	},
	{
		question: "Which events notify?",
		header: "Notify",
		multiSelect: true,
		options: [
			{ label: "Waiting", description: "Session waiting" },
			{ label: "Merged", description: "PR merged" },
		],
	},
];

function stdin(value: unknown) {
	mockReadStdin.mockResolvedValue(Buffer.from(JSON.stringify(value)));
}

describe("askQuestion", () => {
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
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it.each([
		["no questions", { questions: [] }, "at least 1 question"],
		[
			"one option",
			{ questions: [{ ...questions[0], options: [questions[0].options[0]] }] },
			"at least 2 options",
		],
		[
			"missing multiSelect",
			{ questions: [{ ...questions[0], multiSelect: undefined }] },
			"questions.0.multiSelect",
		],
	])("rejects %s before opening the pane", async (_, input, message) => {
		stdin(input);

		await expect(askQuestion({ json: "-" })).rejects.toThrow("process.exit(1)");
		expect(errored.join("\n")).toContain(message);
		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
	});

	it("tells Claude to use the built-in tool outside a session", async () => {
		vi.stubEnv("ASSIST_SESSION", "");
		stdin({ questions });

		await expect(askQuestion({ json: "-" })).rejects.toThrow("process.exit(1)");
		expect(errored.join("\n")).toContain("AskUserQuestion");
		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
	});

	it("tells Claude to use the built-in tool when disabled", async () => {
		mockLoadConfig.mockReturnValue({});
		stdin({ questions });

		await expect(askQuestion({ json: "-" })).rejects.toThrow("process.exit(1)");
		expect(errored.join("\n")).toContain("sessions.askQuestion");
		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
	});

	it("sends a question preview and prints the built-in result text", async () => {
		stdin({ questions });
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "approve",
			answers: {
				"Which layout?": "Grouped",
				"Which events notify?": "Waiting, Merged",
			},
		});

		await askQuestion({ json: "-" });

		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				sessionId: "s1",
				kind: "question",
				body: JSON.stringify({ questions }),
			}),
		);
		expect(logged.at(-1)).toBe(
			'User has answered your questions: "Which layout?"="Grouped", "Which events notify?"="Waiting, Merged". You can now continue with the user\'s answers in mind.',
		);
	});

	it("exits non-zero when the user dismisses the questions", async () => {
		stdin({ questions });
		mockRequestPreviewDecision.mockResolvedValue({ decision: "reject" });

		await expect(askQuestion({ json: "-" })).rejects.toThrow("process.exit(1)");
		expect(errored.join("\n")).toContain("declined to answer");
	});
});
