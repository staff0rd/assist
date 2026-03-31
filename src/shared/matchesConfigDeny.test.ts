import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AssistConfig } from "./types";

const mockLoadConfig = vi.fn<() => Partial<AssistConfig>>();

vi.mock("./loadConfig", () => ({
	loadConfig: () => mockLoadConfig(),
}));

import { matchesConfigDeny } from "./matchesConfigDeny";

beforeEach(() => {
	vi.clearAllMocks();
	mockLoadConfig.mockReturnValue({});
});

describe("matchesConfigDeny", () => {
	it("returns undefined when no deny rules configured", () => {
		mockLoadConfig.mockReturnValue({});
		expect(matchesConfigDeny("rm -rf /")).toBeUndefined();
	});

	it("matches exact command", () => {
		mockLoadConfig.mockReturnValue({
			deny: [{ pattern: "rm -rf", message: "Do not use rm -rf" }],
		});
		expect(matchesConfigDeny("rm -rf")).toEqual({
			pattern: "rm -rf",
			message: "Do not use rm -rf",
		});
	});

	it("matches command with prefix matching", () => {
		mockLoadConfig.mockReturnValue({
			deny: [
				{
					pattern: "git push --force",
					message: "Use --force-with-lease instead",
				},
			],
		});
		expect(matchesConfigDeny("git push --force origin main")).toEqual({
			pattern: "git push --force",
			message: "Use --force-with-lease instead",
		});
	});

	it("does not match partial prefix (no word boundary)", () => {
		mockLoadConfig.mockReturnValue({
			deny: [{ pattern: "rm", message: "no rm" }],
		});
		expect(matchesConfigDeny("rmdir temp")).toBeUndefined();
	});

	it("does not match unrelated command", () => {
		mockLoadConfig.mockReturnValue({
			deny: [{ pattern: "rm -rf", message: "Do not use rm -rf" }],
		});
		expect(matchesConfigDeny("git status")).toBeUndefined();
	});

	it("returns the first matching rule", () => {
		mockLoadConfig.mockReturnValue({
			deny: [
				{ pattern: "git push", message: "No pushing" },
				{ pattern: "git push --force", message: "No force push" },
			],
		});
		expect(matchesConfigDeny("git push --force origin")).toEqual({
			pattern: "git push",
			message: "No pushing",
		});
	});
});
