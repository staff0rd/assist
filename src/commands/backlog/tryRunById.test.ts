import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import type { BacklogItem } from "./types";

vi.mock("./run", () => ({
	run: vi.fn(),
}));

vi.mock("./shared", () => ({
	getReady: vi.fn(async () => ({ orm: {} })),
	getOrigin: vi.fn(() => "origin"),
}));

vi.mock("./loadItem", () => ({
	loadItem: vi.fn(),
}));

vi.mock("./loadItemSummaries", () => ({
	loadItemSummaries: vi.fn(async () => []),
}));

vi.mock("./list/shared", () => ({
	isBlocked: vi.fn(() => false),
}));

import { isBlocked } from "./list/shared";
import { loadItem } from "./loadItem";
import { run } from "./run";
import { tryRunById } from "./tryRunById";

const mockLoadItem = loadItem as unknown as MockInstance;
const mockRun = run as unknown as MockInstance;
const mockIsBlocked = isBlocked as unknown as MockInstance;

function makeItem(overrides: Partial<BacklogItem> = {}): BacklogItem {
	return {
		id: 1,
		type: "story",
		name: "Test item",
		acceptanceCriteria: ["AC1"],
		status: "todo",
		starred: false,
		...overrides,
	};
}

describe("tryRunById", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockIsBlocked.mockReturnValue(false);
	});

	describe("when the item does not exist", () => {
		it("returns false and does not call run", async () => {
			mockLoadItem.mockResolvedValue(undefined);

			const result = await tryRunById("a99");

			expect(result).toBe(false);
			expect(mockRun).not.toHaveBeenCalled();
		});
	});

	describe("when the id is a bare number", () => {
		it("tolerates it, resolves the item, and calls run", async () => {
			mockLoadItem.mockResolvedValue(makeItem({ id: 42 }));

			const result = await tryRunById("42", { allowEdits: true });

			expect(result).toBe(true);
			expect(mockRun).toHaveBeenCalledWith("42", { allowEdits: true });
		});
	});

	describe("when the item is already done", () => {
		it("returns false and does not call run", async () => {
			mockLoadItem.mockResolvedValue(makeItem({ id: 1, status: "done" }));

			const result = await tryRunById("a1");

			expect(result).toBe(false);
			expect(mockRun).not.toHaveBeenCalled();
		});
	});

	describe("when the item is marked won't do", () => {
		it("returns false and does not call run", async () => {
			mockLoadItem.mockResolvedValue(makeItem({ id: 1, status: "wontdo" }));

			const result = await tryRunById("a1");

			expect(result).toBe(false);
			expect(mockRun).not.toHaveBeenCalled();
		});
	});

	describe("when the item is blocked by dependencies", () => {
		it("returns false and does not call run", async () => {
			mockLoadItem.mockResolvedValue(
				makeItem({ id: 1, links: [{ type: "depends-on", targetId: 2 }] }),
			);
			mockIsBlocked.mockReturnValue(true);

			const result = await tryRunById("a1");

			expect(result).toBe(false);
			expect(mockRun).not.toHaveBeenCalled();
		});
	});

	describe("when the item is runnable", () => {
		it("calls run with the id and returns true", async () => {
			mockLoadItem.mockResolvedValue(makeItem({ id: 1 }));

			const result = await tryRunById("a1", { allowEdits: true });

			expect(result).toBe(true);
			expect(mockRun).toHaveBeenCalledWith("a1", { allowEdits: true });
		});

		it("treats in-progress items as runnable", async () => {
			mockLoadItem.mockResolvedValue(
				makeItem({ id: 1, status: "in-progress" }),
			);

			const result = await tryRunById("a1");

			expect(result).toBe(true);
			expect(mockRun).toHaveBeenCalledWith("a1", undefined);
		});
	});
});
