import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { asc, eq } from "drizzle-orm";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { items, planPhases, planTasks } from "../../shared/db/schema";
import { loadItem } from "./loadItem";
import { findOneItem } from "./shared";
import { updatePlan } from "./updatePlan";

const mockRequestPreviewDecision = vi.fn();
const mockFindOneItem = findOneItem as unknown as MockInstance;

vi.mock("./shared", () => ({
	findOneItem: vi.fn(),
}));

vi.mock("../sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (...args: unknown[]) =>
		mockRequestPreviewDecision(...args),
}));

let orm: Db;
let close: () => Promise<void>;
let logSpy: MockInstance<typeof console.log>;

async function seedItem(currentPhase?: number): Promise<void> {
	await orm.insert(items).values({
		id: 1,
		origin: "test",
		name: "Bulk plan changes",
		status: currentPhase === undefined ? "todo" : "in-progress",
		currentPhase: currentPhase ?? null,
	});
	await orm.insert(planPhases).values([
		{ itemId: 1, idx: 0, name: "Read the payload", manualChecks: null },
		{
			itemId: 1,
			idx: 1,
			name: "Render the pane",
			manualChecks: JSON.stringify(["Open the pane"]),
		},
		{ itemId: 1, idx: 2, name: "Wire the command", manualChecks: null },
	]);
	await orm.insert(planTasks).values([
		{ itemId: 1, phaseIdx: 0, idx: 0, task: "Parse the JSON" },
		{ itemId: 1, phaseIdx: 1, idx: 0, task: "Render the phases" },
		{ itemId: 1, phaseIdx: 2, idx: 0, task: "Register update-plan" },
	]);

	const item = await loadItem(orm, 1);
	mockFindOneItem.mockResolvedValue({ orm, item });
}

function writePayload(content: unknown): string {
	const dir = mkdtempSync(join(tmpdir(), "assist-update-plan-"));
	const file = join(dir, "plan.json");
	writeFileSync(file, JSON.stringify(content));
	return file;
}

function getPhases() {
	return orm
		.select({
			idx: planPhases.idx,
			name: planPhases.name,
			manualChecks: planPhases.manualChecks,
		})
		.from(planPhases)
		.where(eq(planPhases.itemId, 1))
		.orderBy(asc(planPhases.idx));
}

function getTasks() {
	return orm
		.select({
			phaseIdx: planTasks.phaseIdx,
			idx: planTasks.idx,
			task: planTasks.task,
		})
		.from(planTasks)
		.where(eq(planTasks.itemId, 1))
		.orderBy(asc(planTasks.phaseIdx), asc(planTasks.idx));
}

async function getCurrentPhase(): Promise<number | null> {
	const [row] = await orm
		.select({ currentPhase: items.currentPhase })
		.from(items)
		.where(eq(items.id, 1));
	return row?.currentPhase ?? null;
}

const restructured = {
	phases: [
		{ name: "Wire the command", tasks: ["Register update-plan"] },
		{
			name: "Preview the plan",
			tasks: ["Render the phases", "Await approval"],
			manualChecks: ["Approve the pane"],
		},
	],
};

beforeEach(async () => {
	({ orm, close } = await createTestDb());
	mockRequestPreviewDecision.mockReset();
	mockFindOneItem.mockReset();
	logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

afterEach(async () => {
	await close();
	vi.restoreAllMocks();
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

describe("update-plan outside a web session", () => {
	it("prints the resulting plan and replaces the stored plan", async () => {
		await seedItem();

		await updatePlan("a1", { json: writePayload(restructured) });

		const output = logSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain("Phase 1: Wire the command");
		expect(output).toContain("Phase 2: Preview the plan");
		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(await getPhases()).toEqual([
			{ idx: 0, name: "Wire the command", manualChecks: null },
			{
				idx: 1,
				name: "Preview the plan",
				manualChecks: JSON.stringify(["Approve the pane"]),
			},
		]);
	});
});

describe("update-plan inside a web session", () => {
	beforeEach(() => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "9";
	});

	it("previews the resulting plan as a backlog-item kind before writing it", async () => {
		await seedItem();
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await updatePlan("a1", { json: writePayload(restructured) });

		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				sessionId: "9",
				title: "Update the plan for a1: Bulk plan changes",
				kind: "backlog-item",
				prNumber: null,
			}),
		);
		const body = mockRequestPreviewDecision.mock.calls[0][0].body as string;
		expect(body).toContain("## Plan");
		expect(body).toContain(
			"### Phase 1: Wire the command (moved from phase 3)",
		);
		expect(body).toContain("- Register update-plan");
		expect(body).toContain("### Phase 2: Preview the plan (added)");
		expect(body).toContain("**Manual checks:**");
		expect(body).toContain("- Approve the pane");
		expect(body).toContain("## Removed phases");
		expect(body).toContain("### Phase 1: Read the payload (removed)");
		expect(body).toContain("### Phase 2: Render the pane (removed)");
	});

	it("replaces the phases and tasks exactly on approval", async () => {
		await seedItem();
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await updatePlan("a1", { json: writePayload(restructured) });

		expect(await getPhases()).toEqual([
			{ idx: 0, name: "Wire the command", manualChecks: null },
			{
				idx: 1,
				name: "Preview the plan",
				manualChecks: JSON.stringify(["Approve the pane"]),
			},
		]);
		expect(await getTasks()).toEqual([
			{ phaseIdx: 0, idx: 0, task: "Register update-plan" },
			{ phaseIdx: 1, idx: 0, task: "Render the phases" },
			{ phaseIdx: 1, idx: 1, task: "Await approval" },
		]);
	});

	it("adds a single phase through the same call", async () => {
		await seedItem();
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await updatePlan("a1", {
			json: writePayload({
				phases: [
					{ name: "Read the payload", tasks: ["Parse the JSON"] },
					{
						name: "Render the pane",
						tasks: ["Render the phases"],
						manualChecks: ["Open the pane"],
					},
					{ name: "Wire the command", tasks: ["Register update-plan"] },
					{ name: "Document it", tasks: ["Update the README"] },
				],
			}),
		});

		expect((await getPhases()).map((p) => p.name)).toEqual([
			"Read the payload",
			"Render the pane",
			"Wire the command",
			"Document it",
		]);
	});

	it("leaves the stored plan untouched when the preview is rejected", async () => {
		await seedItem();
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("process.exit");
		}) as never);
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "reject",
			reason: "keep phase 2",
		});

		await expect(
			updatePlan("a1", { json: writePayload(restructured) }),
		).rejects.toThrow("process.exit");

		expect(errorSpy.mock.calls.map((c) => c.join(" ")).join("\n")).toContain(
			"keep phase 2",
		);
		expect(await getPhases()).toEqual([
			{ idx: 0, name: "Read the payload", manualChecks: null },
			{
				idx: 1,
				name: "Render the pane",
				manualChecks: JSON.stringify(["Open the pane"]),
			},
			{ idx: 2, name: "Wire the command", manualChecks: null },
		]);
		expect(await getTasks()).toEqual([
			{ phaseIdx: 0, idx: 0, task: "Parse the JSON" },
			{ phaseIdx: 1, idx: 0, task: "Render the phases" },
			{ phaseIdx: 2, idx: 0, task: "Register update-plan" },
		]);
	});

	it("clamps currentPhase into a shorter plan and shows the clamp in the preview", async () => {
		await seedItem(3);
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await updatePlan("a1", { json: writePayload(restructured) });

		const body = mockRequestPreviewDecision.mock.calls[0][0].body as string;
		expect(body).toContain("**Current phase:** 3 → 2");
		expect(await getCurrentPhase()).toBe(2);
	});

	it("leaves currentPhase alone when it still fits the new plan", async () => {
		await seedItem(2);
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await updatePlan("a1", { json: writePayload(restructured) });

		const body = mockRequestPreviewDecision.mock.calls[0][0].body as string;
		expect(body).not.toContain("Current phase:");
		expect(await getCurrentPhase()).toBe(2);
	});
});
