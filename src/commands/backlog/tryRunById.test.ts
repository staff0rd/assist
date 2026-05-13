import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import type { BacklogFile, BacklogItem } from "./types";

vi.mock("./run", () => ({
	run: vi.fn(),
}));

vi.mock("./shared", () => ({
	loadBacklog: vi.fn(),
}));

vi.mock("./list/shared", () => ({
	isBlocked: vi.fn(() => false),
}));

import { isBlocked } from "./list/shared";
import { run } from "./run";
import { loadBacklog } from "./shared";
import { tryRunById } from "./tryRunById";

const mockLoadBacklog = loadBacklog as unknown as MockInstance;
const mockRun = run as unknown as MockInstance;
const mockIsBlocked = isBlocked as unknown as MockInstance;

function makeItem(overrides: Partial<BacklogItem> = {}): BacklogItem {
	return {
		id: 1,
		type: "story",
		name: "Test item",
		acceptanceCriteria: ["AC1"],
		status: "todo",
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
			const items: BacklogFile = [makeItem({ id: 1 })];
			mockLoadBacklog.mockReturnValue(items);

			const result = await tryRunById("99");

			expect(result).toBe(false);
			expect(mockRun).not.toHaveBeenCalled();
		});
	});

	describe("when the id is not numeric", () => {
		it("returns false and does not call run", async () => {
			mockLoadBacklog.mockReturnValue([makeItem({ id: 1 })]);

			const result = await tryRunById("abc");

			expect(result).toBe(false);
			expect(mockRun).not.toHaveBeenCalled();
		});
	});

	describe("when the item is already done", () => {
		it("returns false and does not call run", async () => {
			const items: BacklogFile = [makeItem({ id: 1, status: "done" })];
			mockLoadBacklog.mockReturnValue(items);

			const result = await tryRunById("1");

			expect(result).toBe(false);
			expect(mockRun).not.toHaveBeenCalled();
		});
	});

	describe("when the item is marked won't do", () => {
		it("returns false and does not call run", async () => {
			const items: BacklogFile = [makeItem({ id: 1, status: "wontdo" })];
			mockLoadBacklog.mockReturnValue(items);

			const result = await tryRunById("1");

			expect(result).toBe(false);
			expect(mockRun).not.toHaveBeenCalled();
		});
	});

	describe("when the item is blocked by dependencies", () => {
		it("returns false and does not call run", async () => {
			const items: BacklogFile = [makeItem({ id: 1 })];
			mockLoadBacklog.mockReturnValue(items);
			mockIsBlocked.mockReturnValue(true);

			const result = await tryRunById("1");

			expect(result).toBe(false);
			expect(mockRun).not.toHaveBeenCalled();
		});
	});

	describe("when the item is runnable", () => {
		it("calls run with the id and returns true", async () => {
			const items: BacklogFile = [makeItem({ id: 1 })];
			mockLoadBacklog.mockReturnValue(items);

			const result = await tryRunById("1", { allowEdits: true });

			expect(result).toBe(true);
			expect(mockRun).toHaveBeenCalledWith("1", { allowEdits: true });
		});

		it("treats in-progress items as runnable", async () => {
			const items: BacklogFile = [makeItem({ id: 1, status: "in-progress" })];
			mockLoadBacklog.mockReturnValue(items);

			const result = await tryRunById("1");

			expect(result).toBe(true);
			expect(mockRun).toHaveBeenCalledWith("1", undefined);
		});
	});
});
