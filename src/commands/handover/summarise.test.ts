import { execFileSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:child_process", () => ({
	execFileSync: vi.fn(),
}));

vi.mock("../sessions/summarise/iterateUserEntries", () => ({
	iterateUserEntries: vi.fn(),
}));

import { iterateUserEntries } from "../sessions/summarise/iterateUserEntries";
import {
	SUMMARISE_RECURSION_GUARD,
	stripPreludes,
	summarise,
} from "./summarise";

const mockExec = execFileSync as unknown as ReturnType<typeof vi.fn>;
const mockIter = iterateUserEntries as unknown as ReturnType<typeof vi.fn>;

function mockEntries(entries: { text: string; entrypoint?: string }[]) {
	mockIter.mockReturnValue(entries[Symbol.iterator]());
}

describe("stripPreludes", () => {
	it("removes <command-name> and <command-message> blocks", () => {
		const input =
			"<command-message>foo</command-message>\n<command-name>/foo</command-name>\nActual text";
		expect(stripPreludes(input)).toBe("Actual text");
	});

	it("removes <command-args> blocks", () => {
		expect(stripPreludes("<command-args>--flag</command-args> rest")).toBe(
			"rest",
		);
	});

	it("removes <local-command-stdout> blocks", () => {
		expect(
			stripPreludes(
				"<local-command-stdout>output</local-command-stdout>\nbody",
			),
		).toBe("body");
	});

	it("removes <system-reminder> blocks", () => {
		expect(stripPreludes("<system-reminder>hi</system-reminder>\nreal")).toBe(
			"real",
		);
	});

	it("trims surrounding whitespace", () => {
		expect(stripPreludes("   hello   ")).toBe("hello");
	});
});

describe("summarise", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns empty string when no user entries", () => {
		mockEntries([]);
		expect(summarise("/s.jsonl")).toBe("");
		expect(mockExec).not.toHaveBeenCalled();
	});

	it("returns empty string when only sdk-cli entries (sdk-cli transcript)", () => {
		mockEntries([
			{ text: "hello", entrypoint: "sdk-cli" },
			{ text: "world", entrypoint: "sdk-cli" },
		]);
		expect(summarise("/s.jsonl")).toBe("");
		expect(mockExec).not.toHaveBeenCalled();
	});

	it("calls claude -p --model haiku with last user turns", () => {
		mockEntries([
			{ text: "first thing", entrypoint: "cli" },
			{ text: "second thing", entrypoint: "cli" },
		]);
		mockExec.mockReturnValue("Working on the thing");

		const result = summarise("/s.jsonl");

		expect(result).toBe("Working on the thing");
		expect(mockExec).toHaveBeenCalledWith(
			"claude",
			expect.arrayContaining(["-p", "--model", "haiku"]),
			expect.objectContaining({ encoding: "utf8" }),
		);
		const prompt = mockExec.mock.calls[0][1].at(-1) as string;
		expect(prompt).toContain("first thing");
		expect(prompt).toContain("second thing");
	});

	it("sets the recursion guard env var in the spawned process", () => {
		mockEntries([{ text: "hi", entrypoint: "cli" }]);
		mockExec.mockReturnValue("Summary");

		summarise("/s.jsonl");

		const opts = mockExec.mock.calls[0][2] as { env: Record<string, string> };
		expect(opts.env[SUMMARISE_RECURSION_GUARD]).toBe("1");
	});

	it("filters out sdk-cli entries while keeping cli ones", () => {
		mockEntries([
			{ text: "sdk only", entrypoint: "sdk-cli" },
			{ text: "real user turn", entrypoint: "cli" },
		]);
		mockExec.mockReturnValue("real summary");

		summarise("/s.jsonl");

		const prompt = mockExec.mock.calls[0][1].at(-1) as string;
		expect(prompt).toContain("real user turn");
		expect(prompt).not.toContain("sdk only");
	});

	it("strips slash-command preludes from each turn", () => {
		mockEntries([
			{
				text: "<command-message>foo</command-message>\n<command-name>/foo</command-name>\nthe real content",
				entrypoint: "cli",
			},
		]);
		mockExec.mockReturnValue("summary");

		summarise("/s.jsonl");

		const prompt = mockExec.mock.calls[0][1].at(-1) as string;
		expect(prompt).toContain("the real content");
		expect(prompt).not.toContain("<command-name>");
		expect(prompt).not.toContain("<command-message>");
	});

	it("caps the payload at 8 KB, keeping the most recent context", () => {
		const big = "x".repeat(9_000);
		const recent = "RECENT MARKER";
		mockEntries([
			{ text: big, entrypoint: "cli" },
			{ text: recent, entrypoint: "cli" },
		]);
		mockExec.mockReturnValue("ok");

		summarise("/s.jsonl");

		const prompt = mockExec.mock.calls[0][1].at(-1) as string;
		expect(prompt).toContain(recent);
		// Total payload after the template header should be ~8 KB
		// Confirm we did NOT include the full 9_000-char block intact
		const xRun = prompt.match(/x+/)?.[0] ?? "";
		expect(xRun.length).toBeLessThan(9_000);
	});

	it("returns only the first line of multi-line claude output", () => {
		mockEntries([{ text: "hi", entrypoint: "cli" }]);
		mockExec.mockReturnValue("First line\nExtra detail");

		expect(summarise("/s.jsonl")).toBe("First line");
	});

	it("strips wrapping quotes from claude output", () => {
		mockEntries([{ text: "hi", entrypoint: "cli" }]);
		mockExec.mockReturnValue('"Wrapped summary"');

		expect(summarise("/s.jsonl")).toBe("Wrapped summary");
	});

	it("returns empty string when claude fails", () => {
		mockEntries([{ text: "hi", entrypoint: "cli" }]);
		mockExec.mockImplementation(() => {
			throw new Error("timeout");
		});

		expect(summarise("/s.jsonl")).toBe("");
	});

	it("returns empty string when claude produces blank output", () => {
		mockEntries([{ text: "hi", entrypoint: "cli" }]);
		mockExec.mockReturnValue("   \n   ");

		expect(summarise("/s.jsonl")).toBe("");
	});

	it("returns empty string when every turn is empty after stripping preludes", () => {
		mockEntries([
			{ text: "<command-name>/foo</command-name>", entrypoint: "cli" },
		]);

		expect(summarise("/s.jsonl")).toBe("");
		expect(mockExec).not.toHaveBeenCalled();
	});

	it("limits to the last 15 user turns", () => {
		const entries = Array.from({ length: 20 }, (_, i) => ({
			text: `turn-${i}`,
			entrypoint: "cli",
		}));
		mockEntries(entries);
		mockExec.mockReturnValue("ok");

		summarise("/s.jsonl");

		const prompt = mockExec.mock.calls[0][1].at(-1) as string;
		expect(prompt).not.toContain("turn-4");
		expect(prompt).toContain("turn-5");
		expect(prompt).toContain("turn-19");
	});
});
