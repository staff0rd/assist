import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import { makeAssistConfig } from "../../test/mothers/makeAssistConfig";
import { makeBacklogItem } from "../../test/mothers/makeBacklogItem";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

vi.mock("../branch/createBranch", () => ({
	createBranch: vi.fn(),
}));

vi.mock("../branch/generateBranchSlug", () => ({
	generateBranchSlug: vi.fn(),
}));

vi.mock("../sessions/daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));

vi.mock("../../shared/linkedWorktree", () => ({
	linkedWorktree: vi.fn(() => null),
}));

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

import { execSync } from "node:child_process";
import { linkedWorktree } from "../../shared/linkedWorktree";
import { loadConfig } from "../../shared/loadConfig";
import { createBranch } from "../branch/createBranch";
import { deriveBranchSlug } from "../branch/deriveBranchSlug";
import { generateBranchSlug } from "../branch/generateBranchSlug";
import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { ensureStoryBranch } from "./ensureStoryBranch";

const mockLoadConfig = vi.mocked(loadConfig);
const mockCreateBranch = createBranch as unknown as MockInstance;
const mockGenerate = generateBranchSlug as unknown as MockInstance;
const mockLog = appendDaemonLog as unknown as MockInstance;
const mockExec = vi.mocked(execSync);
const mockLinked = linkedWorktree as unknown as MockInstance;

function inWorktree(root: string, head: string): void {
	mockLinked.mockReturnValue({ root, clone: "/git/repo" });
	mockExec.mockImplementation((command: string) =>
		command.startsWith("git rev-parse") ? `${head}\n` : "",
	);
}

function logged(): string[] {
	return mockLog.mock.calls.map((call) => String(call[0]));
}

function gitCommands(): string[] {
	return mockExec.mock.calls.map((call) => String(call[0]));
}

describe("ensureStoryBranch", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockCreateBranch.mockResolvedValue({
			branchName: "add-login-form",
			defaultBranch: "main",
		});
		mockGenerate.mockImplementation((name: string) => deriveBranchSlug(name));
		mockLinked.mockReturnValue(null);
		mockExec.mockReturnValue("");
		delete process.env.ASSIST_BACKLOG_ITEM_ID;
	});

	it("creates a branch when the config has no prs block", async () => {
		mockLoadConfig.mockReturnValue(makeAssistConfig());

		await ensureStoryBranch(makeBacklogItem({ name: "Add login form" }));

		expect(mockCreateBranch).toHaveBeenCalledWith({
			slug: "add-login-form",
			jira: undefined,
		});
	});

	it("does nothing when prs.required is false", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ prs: { required: false } }),
		);

		await ensureStoryBranch(makeBacklogItem());

		expect(mockCreateBranch).not.toHaveBeenCalled();
	});

	it("does nothing when the story already has a recorded branch", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ prs: { required: true } }),
		);

		await ensureStoryBranch(
			makeBacklogItem({ gitRefs: [{ kind: "branch", ref: "existing" }] }),
		);

		expect(mockCreateBranch).not.toHaveBeenCalled();
	});

	it("creates a branch from the item name when required and none recorded", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ prs: { required: true } }),
		);

		await ensureStoryBranch(makeBacklogItem({ name: "Add login form" }));

		expect(mockCreateBranch).toHaveBeenCalledWith({
			slug: "add-login-form",
			jira: undefined,
		});
	});

	it("passes the associated Jira key through to the branch name", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ prs: { required: true } }),
		);

		await ensureStoryBranch(
			makeBacklogItem({ name: "Add login form", jiraKey: "BAD-671" }),
		);

		expect(mockCreateBranch).toHaveBeenCalledWith({
			slug: "add-login-form",
			jira: "BAD-671",
		});
	});

	it("records the item id in the environment so the branch is tied to the story", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ prs: { required: true } }),
		);

		await ensureStoryBranch(makeBacklogItem({ id: 42 }));

		expect(process.env.ASSIST_BACKLOG_ITEM_ID).toBe("42");
	});

	it("records the created branch when prs.required is unset", async () => {
		mockLoadConfig.mockReturnValue(makeAssistConfig());

		await ensureStoryBranch(makeBacklogItem({ id: 42 }));

		expect(logged()).toEqual([
			"backlog run 42: prs.required on and no branch recorded; created add-login-form",
		]);
	});

	it("records why no branch was created when prs.required is false", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ prs: { required: false } }),
		);

		await ensureStoryBranch(makeBacklogItem({ id: 42 }));

		expect(logged()).toEqual([
			"backlog run 42: prs.required is false; left the session on its current branch",
		]);
	});

	it("records why no branch was created when one is already recorded", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ prs: { required: true } }),
		);

		await ensureStoryBranch(
			makeBacklogItem({
				id: 42,
				gitRefs: [{ kind: "branch", ref: "existing" }],
			}),
		);

		expect(logged()).toEqual([
			"backlog run 42: branch existing already recorded; left the session on its current branch",
		]);
	});

	it("switches a worktree parked on its tree branch onto the recorded branch", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ prs: { required: true } }),
		);
		inWorktree("/git/repo-6", "repo-6");

		await ensureStoryBranch(
			makeBacklogItem({
				id: 42,
				gitRefs: [{ kind: "branch", ref: "staff0rd/story" }],
			}),
		);

		expect(gitCommands()).toContain("git switch staff0rd/story");
		expect(logged()).toEqual([
			"backlog run 42: branch staff0rd/story already recorded; switched off repo-6 onto it",
		]);
	});

	it("leaves a worktree already on the recorded branch alone", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ prs: { required: true } }),
		);
		inWorktree("/git/repo-6", "staff0rd/story");

		await ensureStoryBranch(
			makeBacklogItem({ gitRefs: [{ kind: "branch", ref: "staff0rd/story" }] }),
		);

		expect(gitCommands()).not.toContain("git switch staff0rd/story");
	});

	it("keeps going when the switch onto the recorded branch fails", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ prs: { required: true } }),
		);
		inWorktree("/git/repo-6", "repo-6");
		mockExec.mockImplementation((command: string) => {
			if (command.startsWith("git rev-parse")) return "repo-6\n";
			if (command.startsWith("git switch"))
				throw new Error("already checked out");
			return "";
		});

		await ensureStoryBranch(
			makeBacklogItem({
				id: 42,
				gitRefs: [{ kind: "branch", ref: "staff0rd/story" }],
			}),
		);

		expect(logged()).toEqual([
			"backlog run 42: branch staff0rd/story already recorded but the worktree stayed on repo-6: already checked out",
		]);
	});

	it("treats a story whose only ref is a commit as having no branch", async () => {
		mockLoadConfig.mockReturnValue(
			makeAssistConfig({ prs: { required: true } }),
		);

		await ensureStoryBranch(
			makeBacklogItem({ gitRefs: [{ kind: "commit", ref: "abc123" }] }),
		);

		expect(mockCreateBranch).toHaveBeenCalled();
	});
});
