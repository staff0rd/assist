import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import { makeBacklogItem } from "../../test/mothers/makeBacklogItem";
import type { PlanPhase } from "./types";

vi.mock("./shared", () => ({
	findOneItem: vi.fn(),
	getOrigin: vi.fn(() => "github.com/x/assist"),
	setStatus: vi.fn(),
}));

vi.mock("./reconcileResumePhase", () => ({
	reconcileResumePhase: vi.fn(),
}));

import { type PreparedRun, prepareRun } from "./prepareRun";
import { reconcileResumePhase } from "./reconcileResumePhase";
import { findOneItem, setStatus } from "./shared";

async function prepareStartPhase(id: string, resumeSessionId?: string) {
	const result = await prepareRun(id, resumeSessionId);
	return (result as PreparedRun | undefined)?.startPhase;
}

const mockFindOneItem = findOneItem as unknown as MockInstance;
const mockSetStatus = setStatus as unknown as MockInstance;
const mockReconcile = reconcileResumePhase as unknown as MockInstance;

const plan: PlanPhase[] = [
	{ name: "Phase 1", tasks: [{ task: "Do something" }] },
	{ name: "Phase 2", tasks: [{ task: "Do more" }] },
];

describe("prepareRun", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockReconcile.mockImplementation(
			async (_orm, _item, startPhase: number) => startPhase,
		);
	});

	describe("when the item belongs to another repo", () => {
		it("refuses naming the item's repo without touching the item", async () => {
			const error = vi.spyOn(console, "error").mockImplementation(() => {});
			const item = makeBacklogItem({ plan, origin: "github.com/x/apm" });
			mockFindOneItem.mockReturnValue({ orm: {}, item });

			expect(await prepareRun("1")).toBeUndefined();

			expect(error).toHaveBeenCalledWith(
				expect.stringContaining("belongs to github.com/x/apm"),
			);
			expect(process.exitCode).toBe(1);
			expect(mockReconcile).not.toHaveBeenCalled();
			expect(mockSetStatus).not.toHaveBeenCalled();
			process.exitCode = undefined;
			error.mockRestore();
		});

		it("runs when the origin matches ignoring case", async () => {
			const item = makeBacklogItem({ plan, origin: "github.com/X/Assist" });
			mockFindOneItem.mockReturnValue({ orm: {}, item });

			expect(await prepareStartPhase("1")).toBe(0);
		});
	});

	describe("when item is not found", () => {
		it("returns undefined", async () => {
			mockFindOneItem.mockReturnValue(undefined);

			expect(await prepareRun("99")).toBeUndefined();
		});
	});

	describe("when item is already done", () => {
		it("returns undefined without updating status", async () => {
			const item = makeBacklogItem({ plan, currentPhase: 2, status: "done" });
			mockFindOneItem.mockReturnValue({ orm: {}, item });

			expect(await prepareRun("1")).toBeUndefined();
			expect(mockSetStatus).not.toHaveBeenCalled();
		});

		it("returns undefined even when currentPhase exceeds plan length", async () => {
			const item = makeBacklogItem({ plan, currentPhase: 4, status: "done" });
			mockFindOneItem.mockReturnValue({ orm: {}, item });

			expect(await prepareRun("1")).toBeUndefined();
			expect(mockSetStatus).not.toHaveBeenCalled();
		});

		it("returns a done resume when restarted with a resume session", async () => {
			const item = makeBacklogItem({ plan, currentPhase: 3, status: "done" });
			mockFindOneItem.mockReturnValue({ orm: {}, item });

			expect(await prepareRun("1", "sess-1")).toEqual({
				kind: "resume-done",
				item,
				resumeSessionId: "sess-1",
			});
			expect(mockReconcile).not.toHaveBeenCalled();
			expect(mockSetStatus).not.toHaveBeenCalled();
		});
	});

	describe("when all phases including review are already complete", () => {
		it("marks done and returns undefined", async () => {
			const item = makeBacklogItem({
				plan,
				currentPhase: 4,
				status: "in-progress",
			});
			mockFindOneItem.mockReturnValue({ orm: {}, item });

			expect(await prepareRun("1")).toBeUndefined();
			expect(mockSetStatus).toHaveBeenCalledWith("1", "done");
		});
	});

	describe("when item is ready to run", () => {
		it("returns item, plan, and startPhase", async () => {
			const item = makeBacklogItem({ plan });
			mockFindOneItem.mockReturnValue({ orm: {}, item });

			const result = await prepareRun("1");

			expect(result).toEqual({
				item,
				plan: item.plan,
				startPhase: 0,
			});
		});

		it("defaults startPhase to 0 when currentPhase is undefined", async () => {
			const item = makeBacklogItem({ plan, currentPhase: undefined });
			mockFindOneItem.mockReturnValue({ orm: {}, item });

			expect(await prepareStartPhase("1")).toBe(0);
		});

		it("uses currentPhase as startPhase when resuming", async () => {
			const item = makeBacklogItem({ plan, currentPhase: 2 });
			mockFindOneItem.mockReturnValue({ orm: {}, item });

			expect(await prepareStartPhase("1")).toBe(1);
		});

		it("uses the reconciled phase when a resumed conversation diverges", async () => {
			const item = makeBacklogItem({ plan, currentPhase: 2 });
			mockFindOneItem.mockReturnValue({ orm: {}, item });
			mockReconcile.mockResolvedValue(2);

			const startPhase = await prepareStartPhase("1", "f4f18318");

			expect(mockReconcile).toHaveBeenCalledWith({}, item, 1, "f4f18318");
			expect(startPhase).toBe(2);
		});
	});
});
