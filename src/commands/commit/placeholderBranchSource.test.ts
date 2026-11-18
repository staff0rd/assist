import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadItem } from "../backlog/loadItem";
import type { BacklogItem } from "../backlog/types";
import { placeholderBranchSource } from "./placeholderBranchSource";

vi.mock("../../shared/db/getDb", () => ({
	getDb: vi.fn(async () => ({})),
	closeDb: vi.fn(async () => {}),
}));
vi.mock("../backlog/loadItem", () => ({ loadItem: vi.fn() }));

const mockLoadItem = vi.mocked(loadItem);

describe("placeholderBranchSource", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubEnv("ASSIST_BACKLOG_ITEM_ID", "42");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("uses the session item's name and Jira key", async () => {
		mockLoadItem.mockResolvedValue({
			name: "Card layout",
			jiraKey: "ABC-12",
		} as BacklogItem);

		expect(await placeholderBranchSource("fix: card layout")).toEqual({
			text: "Card layout",
			jira: "ABC-12",
		});
		expect(mockLoadItem).toHaveBeenCalledWith({}, 42);
	});

	it("falls back to the commit message without a session item", async () => {
		vi.stubEnv("ASSIST_BACKLOG_ITEM_ID", "");

		expect(await placeholderBranchSource("fix: card layout")).toEqual({
			text: "fix: card layout",
		});
		expect(mockLoadItem).not.toHaveBeenCalled();
	});

	it("falls back to the commit message when the item cannot be loaded", async () => {
		mockLoadItem.mockRejectedValue(new Error("db down"));

		expect(await placeholderBranchSource("fix: card layout")).toEqual({
			text: "fix: card layout",
		});
	});
});
