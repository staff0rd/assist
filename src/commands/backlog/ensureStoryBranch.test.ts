import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import type { BacklogItem } from "./types";

vi.mock("../../shared/loadConfig", () => ({
	loadConfig: vi.fn(),
}));

vi.mock("../branch/createBranch", () => ({
	createBranch: vi.fn(),
}));

vi.mock("../sessions/daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));

import { loadConfig } from "../../shared/loadConfig";
import { createBranch } from "../branch/createBranch";
import { ensureStoryBranch } from "./ensureStoryBranch";

const mockLoadConfig = loadConfig as unknown as MockInstance;
const mockCreateBranch = createBranch as unknown as MockInstance;

function makeItem(overrides: Partial<BacklogItem> = {}): BacklogItem {
	return {
		id: 42,
		type: "story",
		name: "Add login form",
		acceptanceCriteria: [],
		status: "todo",
		starred: false,
		...overrides,
	};
}

describe("ensureStoryBranch", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockCreateBranch.mockResolvedValue({
			branchName: "add-login-form",
			defaultBranch: "main",
		});
		delete process.env.ASSIST_BACKLOG_ITEM_ID;
	});

	it("does nothing when prs.required is unset", async () => {
		mockLoadConfig.mockReturnValue({});

		await ensureStoryBranch(makeItem());

		expect(mockCreateBranch).not.toHaveBeenCalled();
	});

	it("does nothing when prs.required is false", async () => {
		mockLoadConfig.mockReturnValue({ prs: { required: false } });

		await ensureStoryBranch(makeItem());

		expect(mockCreateBranch).not.toHaveBeenCalled();
	});

	it("does nothing when the story already has a recorded branch", async () => {
		mockLoadConfig.mockReturnValue({ prs: { required: true } });

		await ensureStoryBranch(
			makeItem({ gitRefs: [{ kind: "branch", ref: "existing" }] }),
		);

		expect(mockCreateBranch).not.toHaveBeenCalled();
	});

	it("creates a branch from the item name when required and none recorded", async () => {
		mockLoadConfig.mockReturnValue({ prs: { required: true } });

		await ensureStoryBranch(makeItem({ name: "Add login form" }));

		expect(mockCreateBranch).toHaveBeenCalledWith({
			slug: "add-login-form",
			jira: undefined,
		});
	});

	it("passes the associated Jira key through to the branch name", async () => {
		mockLoadConfig.mockReturnValue({ prs: { required: true } });

		await ensureStoryBranch(makeItem({ jiraKey: "BAD-671" }));

		expect(mockCreateBranch).toHaveBeenCalledWith({
			slug: "add-login-form",
			jira: "BAD-671",
		});
	});

	it("records the item id in the environment so the branch is tied to the story", async () => {
		mockLoadConfig.mockReturnValue({ prs: { required: true } });

		await ensureStoryBranch(makeItem({ id: 42 }));

		expect(process.env.ASSIST_BACKLOG_ITEM_ID).toBe("42");
	});

	it("treats a story whose only ref is a commit as having no branch", async () => {
		mockLoadConfig.mockReturnValue({ prs: { required: true } });

		await ensureStoryBranch(
			makeItem({ gitRefs: [{ kind: "commit", ref: "abc123" }] }),
		);

		expect(mockCreateBranch).toHaveBeenCalled();
	});
});
