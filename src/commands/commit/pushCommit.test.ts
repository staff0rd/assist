import { execFileSync, spawnSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";
import { PushFailedError } from "./PushFailedError";
import { pushCommit } from "./pushCommit";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const mockExecFileSync = vi.mocked(execFileSync);
const mockSpawnSync = vi.mocked(spawnSync);

const REJECTED =
	"To github.com:o/r.git\n ! [rejected]        HEAD -> main (fetch first)\nerror: failed to push some refs\n";

type SpawnResult = { status: number; stderr?: string };

function spawnResults(push: SpawnResult[], pull: SpawnResult[] = []): void {
	mockSpawnSync.mockImplementation(((_file: string, args: string[]) => {
		const queue = args[0] === "push" ? push : pull;
		return { stderr: "", ...(queue.shift() ?? { status: 0 }) };
	}) as never);
}

const spawned = (command: string) =>
	mockSpawnSync.mock.calls
		.filter(([file, args]) => file === "git" && args?.[0] === command)
		.map(([, args]) => args);

const pushed = () => spawned("push");

const trunkState = {
	"git symbolic-ref --short HEAD": "assist-2\n",
	"git config --get branch.assist-2.remote": "origin\n",
	"git config --get branch.assist-2.merge": "refs/heads/main\n",
};

type GitOutputs = Record<string, string>;

function gitState(outputs: GitOutputs): void {
	mockExecFileSync.mockImplementation(((file: string, args: string[]) => {
		const command = [file, ...args].join(" ");
		if (command in outputs) return outputs[command];
		if (command.startsWith("git config --get")) throw new Error("exit 1");
		return "";
	}) as never);
}

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "log").mockImplementation(() => {});
	vi.spyOn(process.stderr, "write").mockImplementation(() => true);
	spawnResults([]);
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

	describe("when the push is rejected because the upstream moved", () => {
		it("should rebase onto the push target and retry", () => {
			gitState(trunkState);
			spawnResults([{ status: 1, stderr: REJECTED }, { status: 0 }]);

			pushCommit(true);

			expect(spawned("pull")).toEqual([
				["pull", "--rebase", "--autostash", "origin", "main"],
			]);
			expect(pushed()).toEqual([
				["push", "origin", "HEAD:main"],
				["push", "origin", "HEAD:main"],
			]);
		});

		it("should give up after a bounded number of attempts", () => {
			gitState(trunkState);
			spawnResults([
				{ status: 1, stderr: REJECTED },
				{ status: 1, stderr: REJECTED },
				{ status: 1, stderr: REJECTED },
				{ status: 0 },
			]);

			expect(() => pushCommit(true)).toThrow(
				new PushFailedError(
					"push was still rejected after 3 attempts because the upstream kept moving",
				),
			);
			expect(pushed()).toHaveLength(3);
			expect(spawned("pull")).toHaveLength(2);
		});

		it("should abort the rebase and fail when it conflicts", () => {
			gitState(trunkState);
			spawnResults([{ status: 1, stderr: REJECTED }], [{ status: 1 }]);

			expect(() => pushCommit(true)).toThrow(
				new PushFailedError("rebasing onto origin/main failed"),
			);
			expect(mockExecFileSync).toHaveBeenCalledWith(
				"git",
				["rebase", "--abort"],
				expect.anything(),
			);
			expect(pushed()).toHaveLength(1);
		});
	});

	describe("when the push fails for another reason", () => {
		it("should fail without rebasing, naming git's error", () => {
			gitState(trunkState);
			spawnResults([
				{
					status: 128,
					stderr: "fatal: Could not read from remote repository.\n",
				},
			]);

			expect(() => pushCommit(true)).toThrow(
				new PushFailedError("fatal: Could not read from remote repository."),
			);
			expect(spawned("pull")).toEqual([]);
		});
	});
});
