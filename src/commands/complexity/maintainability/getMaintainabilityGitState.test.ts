import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecSync = vi.fn();

vi.mock("node:child_process", () => ({
	execSync: (...args: unknown[]) => mockExecSync(...args),
}));

import { getMaintainabilityGitState } from "./getMaintainabilityGitState";

const ROOT = "/repo";

function respond(map: Record<string, string>): void {
	mockExecSync.mockImplementation((command: string) => {
		if (command.includes("rev-parse")) return `${ROOT}\n`;
		if (command.includes("--numstat")) return map.numstat ?? "";
		if (command.includes("status")) return map.status ?? "";
		return "";
	});
}

describe("getMaintainabilityGitState", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should flag a file whose changed lines shrank", () => {
		respond({ numstat: "2\t40\tsrc/big.ts\n" });

		const state = getMaintainabilityGitState();

		expect(state.shrunkFiles.has(path.resolve(ROOT, "src/big.ts"))).toBe(true);
	});

	it("should not flag a file that grew", () => {
		respond({ numstat: "40\t2\tsrc/big.ts\n" });

		const state = getMaintainabilityGitState();

		expect(state.shrunkFiles.size).toBe(0);
	});

	it("should detect a newly created source file", () => {
		respond({ status: "?? src/extracted.ts\n" });

		expect(getMaintainabilityGitState().newFileCreated).toBe(true);
	});

	it("should detect a staged new source file", () => {
		respond({ status: "A  src/extracted.ts\n" });

		expect(getMaintainabilityGitState().newFileCreated).toBe(true);
	});

	it("should ignore new non-source files", () => {
		respond({ status: "?? notes.md\n" });

		expect(getMaintainabilityGitState().newFileCreated).toBe(false);
	});

	it("should return an empty state when git is unavailable", () => {
		mockExecSync.mockImplementation(() => {
			throw new Error("not a git repo");
		});

		const state = getMaintainabilityGitState();

		expect(state.shrunkFiles.size).toBe(0);
		expect(state.newFileCreated).toBe(false);
	});
});
