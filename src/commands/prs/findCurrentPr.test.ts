import { beforeEach, describe, expect, it, vi } from "vitest";
import { findCurrentPr } from "./findCurrentPr";

const mockExecFileSync = vi.fn();
vi.mock("node:child_process", () => ({
	execFileSync: (...args: unknown[]) => mockExecFileSync(...args),
	execSync: () => "fix-poll\n",
}));

const mockResolveBaseRepo = vi.fn();
vi.mock("./resolveBaseRepo", () => ({
	resolveBaseRepo: (...args: unknown[]) => mockResolveBaseRepo(...args),
}));
const ORIGIN = { org: "Turtlator", repo: "assist" };
const PARENT = { org: "staff0rd", repo: "assist" };

const GIT_CONFIG: Record<string, string> = {
	"branch.fix-poll.remote": "origin",
	"branch.fix-poll.merge": "refs/heads/fix-poll",
};

function setupGh(view: () => string) {
	mockExecFileSync.mockImplementation((file: string, args: string[]) => {
		if (file === "gh") return view();
		if (args[0] === "config" && args[2] in GIT_CONFIG)
			return `${GIT_CONFIG[args[2]]}\n`;
		if (args[0] === "remote")
			return "https://github.com/Turtlator/assist.git\n";
		throw new Error("exit 1");
	});
}

function ghArgs(): string[] {
	return mockExecFileSync.mock.calls.find(([file]) => file === "gh")?.[1];
}

beforeEach(() => {
	vi.clearAllMocks();
	mockResolveBaseRepo.mockReturnValue({
		base: PARENT,
		origin: ORIGIN,
		mode: "auto",
	});
});

describe("findCurrentPr", () => {
	describe("in a fork clone targeting the parent", () => {
		it("should find the branch's PR in the parent by fork-qualified head", () => {
			setupGh(() => JSON.stringify({ number: 42, state: "OPEN" }));

			expect(findCurrentPr()).toEqual({ number: 42, state: "OPEN" });
			expect(ghArgs()).toEqual([
				"pr",
				"view",
				"Turtlator:fix-poll",
				"--json",
				"number,state",
				"-R",
				"staff0rd/assist",
			]);
		});

		it("should return null when the parent has no PR for the branch", () => {
			setupGh(() => {
				throw new Error('no pull requests found for branch "fix-poll"');
			});

			expect(findCurrentPr()).toBeNull();
		});
	});

	describe("when the base repo is overridden to origin", () => {
		it("should look the PR up in the fork by bare branch name", () => {
			mockResolveBaseRepo.mockReturnValue({
				base: ORIGIN,
				origin: ORIGIN,
				mode: "origin",
			});
			setupGh(() => JSON.stringify({ number: 3, state: "OPEN" }));

			expect(findCurrentPr("origin")).toEqual({ number: 3, state: "OPEN" });
			expect(mockResolveBaseRepo).toHaveBeenCalledWith("origin");
			expect(ghArgs()).toEqual([
				"pr",
				"view",
				"fix-poll",
				"--json",
				"number,state",
				"-R",
				"Turtlator/assist",
			]);
		});
	});
});
