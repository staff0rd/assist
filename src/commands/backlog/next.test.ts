import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import type { BacklogFile, BacklogItem } from "./types";

vi.mock("enquirer", () => ({
	default: { prompt: vi.fn() },
}));

vi.mock("./acquireLock", () => ({
	isLockedByOther: vi.fn(() => false),
}));

vi.mock("./list/shared", () => ({
	isBlocked: vi.fn(() => false),
	typeLabel: vi.fn((t: string) => t),
}));

vi.mock("./run", () => ({
	run: vi.fn(),
}));

vi.mock("./shared", () => ({
	loadBacklog: vi.fn(),
}));

vi.mock("./blockedByHandover", () => ({
	blockedByHandover: vi.fn(() => false),
}));

vi.mock("../../shared/exitOnCancel", () => ({
	exitOnCancel: vi.fn((p: Promise<unknown>) => p),
}));

import enquirer from "enquirer";
import { blockedByHandover } from "./blockedByHandover";
import { isBlocked } from "./list/shared";
import { next } from "./next";
import { run } from "./run";
import { loadBacklog } from "./shared";

const mockIsBlocked = isBlocked as unknown as MockInstance;
const mockLoadBacklog = loadBacklog as unknown as MockInstance;
const mockRun = run as unknown as MockInstance;
const mockPrompt = enquirer.prompt as unknown as MockInstance;
const mockBlockedByHandover = blockedByHandover as unknown as MockInstance;

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

describe("next", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("when a handover is pending", () => {
		it("exits immediately without loading the backlog or prompting", async () => {
			mockBlockedByHandover.mockReturnValueOnce(true);

			await next();

			expect(mockLoadBacklog).not.toHaveBeenCalled();
			expect(mockPrompt).not.toHaveBeenCalled();
			expect(mockRun).not.toHaveBeenCalled();
		});
	});

	describe("when first pick has exactly one unblocked todo", () => {
		it("auto-selects without prompting", async () => {
			const items: BacklogFile = [makeItem({ id: 5, name: "Only item" })];
			mockLoadBacklog.mockReturnValue(items);
			mockRun.mockResolvedValueOnce(false);

			await next();

			expect(mockPrompt).not.toHaveBeenCalled();
			expect(mockRun).toHaveBeenCalledWith("5", undefined);
		});
	});

	describe("when first pick has multiple unblocked todos", () => {
		it("shows the selection prompt", async () => {
			const items: BacklogFile = [
				makeItem({ id: 1, name: "Item A" }),
				makeItem({ id: 2, name: "Item B" }),
			];
			mockLoadBacklog.mockReturnValue(items);
			mockPrompt.mockResolvedValueOnce({ selected: "story #1: Item A" });
			mockRun.mockResolvedValueOnce(false);

			await next();

			expect(mockPrompt).toHaveBeenCalled();
		});
	});

	describe("when first pick has one todo but it is blocked", () => {
		it("exits without prompting", async () => {
			const items: BacklogFile = [makeItem({ id: 1 })];
			mockIsBlocked.mockReturnValue(true);
			mockLoadBacklog.mockReturnValue(items);

			await next();

			expect(mockPrompt).not.toHaveBeenCalled();
			expect(mockRun).not.toHaveBeenCalled();
		});
	});

	describe("on subsequent iterations", () => {
		it("shows the selection prompt even with one unblocked todo", async () => {
			mockIsBlocked.mockReturnValue(false);
			const firstItems: BacklogFile = [makeItem({ id: 1, name: "Item A" })];
			const secondItems: BacklogFile = [makeItem({ id: 2, name: "Item B" })];
			mockLoadBacklog
				.mockReturnValueOnce(firstItems)
				.mockReturnValueOnce(secondItems);
			mockRun.mockResolvedValueOnce(true); // first item completes
			mockPrompt.mockResolvedValueOnce({ selected: "story #2: Item B" });
			mockRun.mockResolvedValueOnce(false); // second item does not complete

			await next();

			// First call: auto-selected (no prompt)
			// Second call: should prompt even though only one item
			expect(mockPrompt).toHaveBeenCalledTimes(1);
			expect(mockRun).toHaveBeenCalledTimes(2);
			expect(mockRun).toHaveBeenNthCalledWith(1, "1", undefined);
			expect(mockRun).toHaveBeenNthCalledWith(2, "2", undefined);
		});
	});
});
