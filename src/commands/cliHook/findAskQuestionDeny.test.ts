import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockLoadConfig = vi.fn();
const mockIsLive = vi.fn();

vi.mock("../../shared/loadConfig", () => ({
	loadConfig: () => mockLoadConfig(),
}));

vi.mock("../sessions/shared/isLiveDaemonSession", () => ({
	isLiveDaemonSession: (id: string) => mockIsLive(id),
}));

import { findAskQuestionDeny } from "./findAskQuestionDeny";
import { tryParseInput } from "./tryParseInput";

const questions = [
	{
		question: "Which?",
		header: "Pick",
		multiSelect: false,
		options: [
			{ label: "A", description: "a" },
			{ label: "B", description: "b" },
		],
	},
];

function parse(toolInput: Record<string, unknown>) {
	return tryParseInput(
		JSON.stringify({
			hook_event_name: "PreToolUse",
			tool_name: "AskUserQuestion",
			tool_input: toolInput,
		}),
	);
}

beforeEach(() => {
	vi.stubEnv("ASSIST_SESSION", "1");
	vi.stubEnv("ASSIST_SESSION_ID", "s1");
	mockLoadConfig.mockReturnValue({ sessions: { askQuestion: true } });
	mockIsLive.mockResolvedValue(true);
});

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("tryParseInput AskUserQuestion", () => {
	it("parses the questions as JSON input for assist ask-question", () => {
		expect(parse({ questions, answers: {} })).toEqual({
			kind: "question",
			toolName: "AskUserQuestion",
			command: JSON.stringify({ questions }),
		});
	});

	it("ignores input without a questions array", () => {
		expect(parse({ questions: "nope" })).toBeUndefined();
	});
});

describe("findAskQuestionDeny", () => {
	it("denies in a live assist session, naming assist ask-question and the input", async () => {
		const json = JSON.stringify({ questions });
		const decision = await findAskQuestionDeny(json);
		expect(mockIsLive).toHaveBeenCalledWith("s1");
		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toContain(
			"assist ask-question --json - < <file>",
		);
		expect(decision?.permissionDecisionReason).toContain(json);
	});

	it("allows outside an assist session", async () => {
		vi.stubEnv("ASSIST_SESSION", "");
		expect(await findAskQuestionDeny("{}")).toBeUndefined();
	});

	it("allows when sessions.askQuestion is off", async () => {
		mockLoadConfig.mockReturnValue({ sessions: { askQuestion: false } });
		expect(await findAskQuestionDeny("{}")).toBeUndefined();
	});

	it("allows when the daemon does not know the session", async () => {
		mockIsLive.mockResolvedValue(false);
		expect(await findAskQuestionDeny("{}")).toBeUndefined();
	});
});
