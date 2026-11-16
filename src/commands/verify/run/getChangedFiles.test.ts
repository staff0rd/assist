import { beforeEach, describe, expect, it, vi } from "vitest";

const gitResponses = new Map<string, string>();

vi.mock("node:child_process", () => ({
	execFileSync: (file: string, args: string[]) => {
		const command = [file, ...args].join(" ");
		const response = gitResponses.get(command);
		if (response === undefined) throw new Error(`git failed: ${command}`);
		return response;
	},
}));

vi.mock("../../../shared/loadConfig", () => ({
	loadConfig: () => ({}),
}));

import { getChangedFiles } from "./getChangedFiles";

function respond(command: string, output: string): void {
	gitResponses.set(`git ${command}`, output);
}

const UNTRACKED = "ls-files --others --exclude-standard --full-name -- :/";

function withRemoteDefault(): void {
	respond(
		"symbolic-ref --quiet --short refs/remotes/origin/HEAD",
		"origin/main",
	);
	respond("rev-parse --verify --quiet origin/main^{commit}", "abc");
	respond("merge-base origin/main HEAD", "base123\n");
}

describe("getChangedFiles", () => {
	beforeEach(() => {
		gitResponses.clear();
		respond(UNTRACKED, "");
	});

	it("includes committed branch changes since the merge-base", () => {
		withRemoteDefault();
		respond("diff --name-only base123", "coach-tools/src/app.ts\n");
		respond("diff --name-only HEAD", "");

		expect(getChangedFiles()).toEqual(["coach-tools/src/app.ts"]);
	});

	it("includes untracked files", () => {
		withRemoteDefault();
		respond("diff --name-only base123", "");
		respond(UNTRACKED, "member-app/new.ts\n");

		expect(getChangedFiles()).toEqual(["member-app/new.ts"]);
	});

	it("unions tracked and untracked changes without duplicates", () => {
		withRemoteDefault();
		respond("diff --name-only base123", "a.ts\nb.ts");
		respond(UNTRACKED, "b.ts\nc.ts");

		expect(getChangedFiles()).toEqual(["a.ts", "b.ts", "c.ts"]);
	});

	it("falls back to the diff against HEAD when no remote default resolves", () => {
		respond("diff --name-only HEAD", "src/local.ts");
		respond(UNTRACKED, "src/new.ts");

		expect(getChangedFiles()).toEqual(["src/local.ts", "src/new.ts"]);
	});

	it("falls back to origin/main when origin/HEAD is unset", () => {
		respond("rev-parse --verify --quiet origin/main^{commit}", "abc");
		respond("merge-base origin/main HEAD", "base456");
		respond("diff --name-only base456", "committed.ts");

		expect(getChangedFiles()).toEqual(["committed.ts"]);
	});

	it("falls back to HEAD when the merge-base cannot be found", () => {
		respond("rev-parse --verify --quiet origin/main^{commit}", "abc");
		respond("diff --name-only HEAD", "local.ts");

		expect(getChangedFiles()).toEqual(["local.ts"]);
	});
});
