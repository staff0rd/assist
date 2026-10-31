import { stripVTControlCharacters } from "node:util";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockReadStdin = vi.fn();
const mockRelayRateLimits = vi.fn();
const mockRelayUsage = vi.fn();

vi.mock("../lib/readStdin", () => ({
	readStdin: () => mockReadStdin(),
}));

vi.mock("./readGitBranch", () => ({
	readGitBranch: () => "main",
}));

vi.mock("./relayRateLimits", () => ({
	relayRateLimits: (rateLimits: unknown) => mockRelayRateLimits(rateLimits),
}));

vi.mock("./relayUsage", () => ({
	relayUsage: (...args: unknown[]) => mockRelayUsage(...args),
}));

import { statusLine } from "./statusLine";

const rateLimits = {
	five_hour: { used_percentage: 12 },
	seven_day: { used_percentage: 34 },
};

const input = {
	session_id: "s1",
	transcript_path: "/t.jsonl",
	model: { display_name: "Opus" },
	context_window: {
		total_input_tokens: 1200,
		total_output_tokens: 340,
		used_percentage: 10,
	},
	rate_limits: rateLimits,
	cwd: "/repo",
};

const baseLine = "🌿️ main | Opus | Tokens - 1,200 ↑ : 340 ↓ | Context - 10%";

describe("statusLine", () => {
	let logged: string[];

	beforeEach(() => {
		vi.clearAllMocks();
		logged = [];
		mockReadStdin.mockResolvedValue(JSON.stringify(input));
		vi.spyOn(console, "log").mockImplementation((message: string) => {
			logged.push(stripVTControlCharacters(message));
		});
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
	});

	it("omits the limits segment in an assist session", async () => {
		vi.stubEnv("ASSIST_SESSION", "1");

		await statusLine();

		expect(logged).toEqual([baseLine]);
		expect(mockRelayRateLimits).toHaveBeenCalledWith(rateLimits);
		expect(mockRelayUsage).toHaveBeenCalledWith("s1", "/t.jsonl", 10);
	});

	it("appends the limits segment outside an assist session", async () => {
		vi.stubEnv("ASSIST_SESSION", "");

		await statusLine();

		expect(logged).toEqual([`${baseLine} | Limits - 12% (5h), 34% (7d)`]);
		expect(mockRelayRateLimits).toHaveBeenCalledWith(rateLimits);
		expect(mockRelayUsage).toHaveBeenCalledWith("s1", "/t.jsonl", 10);
	});
});
