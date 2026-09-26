import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfigFrom } from "../../../shared/loadConfigFrom";
import { defaultBranchRef } from "./defaultBranchRef";
import { execGit } from "./execGit";

vi.mock("./execGit", () => ({ execGit: vi.fn() }));
vi.mock("../../../shared/loadConfigFrom", () => ({ loadConfigFrom: vi.fn() }));

const execGitMock = vi.mocked(execGit);
const loadConfigFromMock = vi.mocked(loadConfigFrom);

type GitResponder = (args: string[]) => string | undefined;

function withGit(responder: GitResponder): void {
	execGitMock.mockImplementation(async (_cwd, args) => {
		const result = responder(args);
		if (result === undefined) throw new Error(`git ${args.join(" ")} failed`);
		return result;
	});
}

function withDefaultBranch(defaultBranch?: string): void {
	loadConfigFromMock.mockReturnValue(
		(defaultBranch ? { branch: { defaultBranch } } : {}) as ReturnType<
			typeof loadConfigFrom
		>,
	);
}

function gitArgs(): string[][] {
	return execGitMock.mock.calls.map(([, args]) => args);
}

describe("defaultBranchRef", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		withDefaultBranch();
	});

	it("uses the configured default branch", async () => {
		withDefaultBranch("develop");
		withGit(() => "");

		expect(await defaultBranchRef("/repo")).toBe("origin/develop");
		expect(gitArgs()).toEqual([
			["rev-parse", "--verify", "--quiet", "origin/develop^{commit}"],
		]);
	});

	it("falls back to the origin HEAD ref when no branch is configured", async () => {
		withGit((args) =>
			args[0] === "symbolic-ref" ? "refs/remotes/origin/main\n" : "",
		);

		expect(await defaultBranchRef("/repo")).toBe("origin/main");
		expect(gitArgs()).toEqual([
			["symbolic-ref", "--quiet", "refs/remotes/origin/HEAD"],
			["rev-parse", "--verify", "--quiet", "origin/main^{commit}"],
		]);
	});

	it("falls back to origin/main when origin HEAD is not set", async () => {
		withGit((args) => (args[0] === "symbolic-ref" ? undefined : ""));

		expect(await defaultBranchRef("/repo")).toBe("origin/main");
	});

	it("falls back to origin/master when only master exists locally", async () => {
		withGit((args) => {
			if (args[0] === "symbolic-ref") return undefined;
			return args[3] === "origin/master^{commit}" ? "" : undefined;
		});

		expect(await defaultBranchRef("/repo")).toBe("origin/master");
	});

	it("returns undefined when origin HEAD names an unexpected ref", async () => {
		withGit((args) =>
			args[0] === "symbolic-ref" ? "refs/heads/main\n" : undefined,
		);

		expect(await defaultBranchRef("/repo")).toBeUndefined();
	});

	it("returns undefined when no candidate ref exists locally", async () => {
		withDefaultBranch("develop");
		withGit((args) => (args[0] === "rev-parse" ? undefined : ""));

		expect(await defaultBranchRef("/repo")).toBeUndefined();
		expect(gitArgs()).toEqual([
			["rev-parse", "--verify", "--quiet", "origin/develop^{commit}"],
			["rev-parse", "--verify", "--quiet", "origin/main^{commit}"],
			["rev-parse", "--verify", "--quiet", "origin/master^{commit}"],
		]);
	});

	it("resolves the ref without fetching", async () => {
		withDefaultBranch("main");
		withGit(() => "");

		await defaultBranchRef("/repo");

		expect(gitArgs().some((args) => args[0] === "fetch")).toBe(false);
	});

	it("falls back to origin HEAD when the config cannot be read", async () => {
		loadConfigFromMock.mockImplementation(() => {
			throw new Error("bad config");
		});
		withGit((args) =>
			args[0] === "symbolic-ref" ? "refs/remotes/origin/main\n" : "",
		);

		expect(await defaultBranchRef("/repo")).toBe("origin/main");
	});
});
