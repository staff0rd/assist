import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecFileSync = vi.fn();

vi.mock("node:child_process", () => ({
	execFileSync: (...args: unknown[]) => mockExecFileSync(...args),
}));

import { currentPrSelector } from "./currentPrSelector";

function gitConfig(values: Record<string, string>) {
	mockExecFileSync.mockImplementation((_file: string, args: string[]) => {
		const key = args[0] === "config" ? args[2] : `remote:${args[2]}`;
		if (key in values) return `${values[key]}\n`;
		throw new Error("exit 1");
	});
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe("currentPrSelector", () => {
	describe("on a cross-repository PR branch checked out from the fork", () => {
		it("should qualify the branch with the fork owner", () => {
			gitConfig({
				"branch.fix-poll.remote": "git@github.com:Turtlator/assist.git",
				"branch.fix-poll.merge": "refs/heads/fix-poll",
			});

			expect(currentPrSelector("fix-poll", "staff0rd")).toBe(
				"Turtlator:fix-poll",
			);
		});

		it("should use the fork's head branch when the local branch is named differently", () => {
			gitConfig({
				"branch.local-name.remote": "git@github.com:Turtlator/assist.git",
				"branch.local-name.merge": "refs/heads/fix-poll",
			});

			expect(currentPrSelector("local-name", "staff0rd")).toBe(
				"Turtlator:fix-poll",
			);
		});

		it("should resolve a named fork remote to its owner", () => {
			gitConfig({
				"branch.fix-poll.remote": "turtlator",
				"remote:turtlator": "https://github.com/Turtlator/assist.git",
			});

			expect(currentPrSelector("fix-poll", "staff0rd")).toBe(
				"Turtlator:fix-poll",
			);
		});
	});

	describe("on a PR branch tracking the base repo's pull ref", () => {
		it("should select the PR by number", () => {
			gitConfig({
				"branch.fix-poll.remote": "origin",
				"branch.fix-poll.merge": "refs/pull/14/head",
			});

			expect(currentPrSelector("fix-poll", "staff0rd")).toBe("14");
		});
	});

	describe("on a same-repository branch", () => {
		it("should use the bare branch name", () => {
			gitConfig({
				"branch.feature.remote": "origin",
				"branch.feature.merge": "refs/heads/feature",
				"remote:origin": "git@github.com:staff0rd/assist.git",
			});

			expect(currentPrSelector("feature", "Staff0rd")).toBe("feature");
		});
	});

	describe("on a branch with no upstream config", () => {
		it("should use the bare branch name", () => {
			gitConfig({});

			expect(currentPrSelector("local-only", "staff0rd")).toBe("local-only");
		});
	});
});
