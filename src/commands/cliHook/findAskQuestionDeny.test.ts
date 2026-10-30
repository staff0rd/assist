import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockLoadConfig = vi.fn();

vi.mock("../../shared/loadConfig", () => ({
	loadConfig: () => mockLoadConfig(),
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
	mockLoadConfig.mockReturnValue({ sessions: { askQuestion: true } });
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
	it("denies in an assist session, naming assist ask-question and the input", () => {
		const json = JSON.stringify({ questions });
		const decision = findAskQuestionDeny(json);
		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toContain(
			"assist ask-question --json - < <file>",
		);
		expect(decision?.permissionDecisionReason).toContain(json);
	});

	it("allows outside an assist session", () => {
		vi.stubEnv("ASSIST_SESSION", "");
		expect(findAskQuestionDeny("{}")).toBeUndefined();
	});

	it("allows when sessions.askQuestion is off", () => {
		mockLoadConfig.mockReturnValue({ sessions: { askQuestion: false } });
		expect(findAskQuestionDeny("{}")).toBeUndefined();
	});
});
