import { execFileSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";
import { pushCommit } from "./pushCommit";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const mockExecFileSync = vi.mocked(execFileSync);

type GitOutputs = Record<string, string>;

function gitState(outputs: GitOutputs): void {
	mockExecFileSync.mockImplementation(((file: string, args: string[]) => {
		const command = [file, ...args].join(" ");
		if (command in outputs) return outputs[command];
		if (command.startsWith("git config --get")) throw new Error("exit 1");
		return "";
	}) as never);
}

const pushed = () =>
	mockExecFileSync.mock.calls
		.filter(([file, args]) => file === "git" && args?.[0] === "push")
		.map(([, args]) => args);

beforeEach(() => {
	vi.clearAllMocks();
});

describe("pushCommit", () => {
	describe("when the upstream branch name matches the local branch", () => {
		it("should push plainly", () => {
			gitState({
				"git symbolic-ref --short HEAD": "feature-x\n",
				"git config --get branch.feature-x.remote": "origin\n",
				"git config --get branch.feature-x.merge": "refs/heads/feature-x\n",
			});

			pushCommit(true);

			expect(pushed()).toEqual([["push"]]);
		});
	});

	describe("when the upstream branch name differs and trunk-based work is on", () => {
		it("should push HEAD at the tracked mainline explicitly", () => {
			gitState({
				"git symbolic-ref --short HEAD": "assist-2\n",
				"git config --get branch.assist-2.remote": "origin\n",
				"git config --get branch.assist-2.merge": "refs/heads/main\n",
			});

			pushCommit(true);

			expect(pushed()).toEqual([["push", "origin", "HEAD:main"]]);
		});
	});

	describe("when the upstream branch name differs and trunk-based work is off", () => {
		it("should push the branch to its own remote branch rather than the mainline", () => {
			gitState({
				"git symbolic-ref --short HEAD": "feature-x\n",
				"git config --get branch.feature-x.remote": "origin\n",
				"git config --get branch.feature-x.merge": "refs/heads/main\n",
			});

			pushCommit(false);

			expect(pushed()).toEqual([
				["push", "--set-upstream", "origin", "HEAD:feature-x"],
			]);
		});
	});

	describe("when the branch has no upstream", () => {
		it("should push plainly so git reports its own guidance", () => {
			gitState({ "git symbolic-ref --short HEAD": "feature-x\n" });

			pushCommit(false);

			expect(pushed()).toEqual([["push"]]);
		});
	});

	describe("when HEAD is detached", () => {
		it("should push plainly", () => {
			mockExecFileSync.mockImplementation(((_file: string, args: string[]) => {
				if (args.join(" ") === "symbolic-ref --short HEAD")
					throw new Error("not a symbolic ref");
				return "";
			}) as never);

			pushCommit(true);

			expect(pushed()).toEqual([["push"]]);
		});
	});
});
