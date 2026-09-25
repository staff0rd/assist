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
import {
	items,
	itemSubtasks,
	planPhases,
	planTasks,
} from "../../shared/db/schema";
import type { AssistConfig } from "../../shared/types";
import { propose } from "./propose";

let orm: Db;
let close: () => Promise<void>;
let mockConfig: AssistConfig;
let claudeCode: boolean;

const mockRequestPreviewDecision = vi.fn();

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
}));

vi.mock("./shared", () => ({
	getOrigin: () => "test",
}));

vi.mock("./ensureRemoteOrigin", () => ({
	ensureRemoteOrigin: () => true,
}));

vi.mock("../../lib/isClaudeCode", () => ({
	isClaudeCode: () => claudeCode,
}));

vi.mock("../../shared/loadConfig", () => ({
	loadConfig: () => mockConfig,
}));

vi.mock("../sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (...args: unknown[]) =>
		mockRequestPreviewDecision(...args),
}));

const bug = {
	name: "Preview never opens",
	type: "bug",
	description: "**Repro:**\n\n1. File a bug",
	acceptanceCriteria: ["The pane opens", "Approval creates the item"],
};

const story = {
	name: "Preview backlog items",
	type: "story",
	description: "## Background\n\nItems need a gate.",
	acceptanceCriteria: ["The plan is reviewed"],
	phases: [
		{ name: "Render the plan", tasks: ["Extend the payload", "Render it"] },
		{
			name: "Insert the phases",
			tasks: ["Write every phase"],
			manualChecks: ["Run /draft end to end"],
		},
	],
};

function writePayload(content: unknown): string {
	const dir = mkdtempSync(join(tmpdir(), "assist-propose-"));
	const file = join(dir, "item.json");
	writeFileSync(file, JSON.stringify(content));
	return file;
}

function allItems() {
	return orm
		.select({ id: items.id, name: items.name, type: items.type })
		.from(items);
}

let logSpy: MockInstance<typeof console.log>;

beforeEach(async () => {
	({ orm, close } = await createTestDb());
	mockConfig = {} as AssistConfig;
	claudeCode = false;
	process.exitCode = undefined;
	mockRequestPreviewDecision.mockReset();
	logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

afterEach(async () => {
	await close();
	vi.restoreAllMocks();
	process.exitCode = undefined;
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

describe("propose outside a web session", () => {
	it("prints the rendered item and creates it", async () => {
		await propose({ json: writePayload(bug) });

		const output = logSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain("Preview never opens");
		expect(output).toContain("The pane opens");
		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();

		const created = await allItems();
		expect(created).toHaveLength(1);
		expect(created[0]).toMatchObject({
			name: "Preview never opens",
			type: "bug",
		});
	});
});

describe("propose by an agent outside a web session", () => {
	beforeEach(() => {
		claudeCode = true;
	});

	it("prints the draft with a re-run instruction and writes nothing", async () => {
		await propose({ json: writePayload(story) });

		const output = logSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain("Preview backlog items");
		expect(output).toContain("Render the plan");
		expect(output).toContain("--confirmed");
		expect(output).not.toContain("Added item");
		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(process.exitCode).toBeUndefined();
		expect(await allItems()).toEqual([]);
	});

	it("creates the item and every phase with --confirmed", async () => {
		await propose({ json: writePayload(story), confirmed: true });

		const [item] = await allItems();
		expect(item.name).toBe("Preview backlog items");
		expect(logSpy.mock.calls.map((c) => c.join(" ")).join("\n")).toContain(
			"Added item",
		);
		expect(
			await orm
				.select({ idx: planPhases.idx, name: planPhases.name })
				.from(planPhases)
				.where(eq(planPhases.itemId, item.id))
				.orderBy(asc(planPhases.idx)),
		).toEqual([
			{ idx: 0, name: "Render the plan" },
			{ idx: 1, name: "Insert the phases" },
		]);
	});
});

describe("propose inside a web session", () => {
	beforeEach(() => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "7";
	});

	it("previews the item as a backlog-item kind before creating it", async () => {
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await propose({ json: writePayload(bug) });

		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				sessionId: "7",
				title: "Preview never opens",
				kind: "backlog-item",
				itemType: "bug",
				prNumber: null,
			}),
		);
		const body = mockRequestPreviewDecision.mock.calls[0][0].body as string;
		expect(body).toContain("**Type:** bug");
		expect(body).toContain("1. File a bug");
		expect(body).toContain("1. The pane opens");
	});

	it("writes the item, the bug's Fix phase and configured sub-tasks on approval", async () => {
		mockConfig = { subtasks: [{ title: "Write tests" }] } as AssistConfig;
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await propose({ json: writePayload(bug) });

		const [item] = await allItems();
		expect(item.name).toBe("Preview never opens");
		expect(
			await orm
				.select({ idx: planPhases.idx, name: planPhases.name })
				.from(planPhases)
				.where(eq(planPhases.itemId, item.id))
				.orderBy(asc(planPhases.idx)),
		).toEqual([{ idx: 0, name: "Fix" }]);
		expect(
			await orm
				.select({ title: itemSubtasks.title })
				.from(itemSubtasks)
				.where(eq(itemSubtasks.itemId, item.id)),
		).toEqual([{ title: "Write tests" }]);
	});

	it("renders the plan in the previewed body", async () => {
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await propose({ json: writePayload(story) });

		const body = mockRequestPreviewDecision.mock.calls[0][0].body as string;
		expect(body).toContain("## Plan");
		expect(body).toContain("### Phase 1: Render the plan");
		expect(body).toContain("- Extend the payload");
		expect(body).toContain("### Phase 2: Insert the phases");
		expect(body).toContain("**Manual checks:**");
		expect(body).toContain("- Run /draft end to end");
	});

	it("writes every phase in order on approval", async () => {
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await propose({ json: writePayload(story) });

		const [item] = await allItems();
		expect(
			await orm
				.select({
					idx: planPhases.idx,
					name: planPhases.name,
					manualChecks: planPhases.manualChecks,
				})
				.from(planPhases)
				.where(eq(planPhases.itemId, item.id))
				.orderBy(asc(planPhases.idx)),
		).toEqual([
			{ idx: 0, name: "Render the plan", manualChecks: null },
			{
				idx: 1,
				name: "Insert the phases",
				manualChecks: JSON.stringify(["Run /draft end to end"]),
			},
		]);
		expect(
			await orm
				.select({
					phaseIdx: planTasks.phaseIdx,
					idx: planTasks.idx,
					task: planTasks.task,
				})
				.from(planTasks)
				.where(eq(planTasks.itemId, item.id))
				.orderBy(asc(planTasks.phaseIdx), asc(planTasks.idx)),
		).toEqual([
			{ phaseIdx: 0, idx: 0, task: "Extend the payload" },
			{ phaseIdx: 0, idx: 1, task: "Render it" },
			{ phaseIdx: 1, idx: 0, task: "Write every phase" },
		]);
	});

	it("uses the payload's phases instead of a bug's default Fix phase", async () => {
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await propose({
			json: writePayload({
				...bug,
				phases: [{ name: "Patch the guard", tasks: ["Add the check"] }],
			}),
		});

		const [item] = await allItems();
		expect(
			await orm
				.select({ name: planPhases.name })
				.from(planPhases)
				.where(eq(planPhases.itemId, item.id)),
		).toEqual([{ name: "Patch the guard" }]);
	});

	it("exits non-zero without creating the item when the preview is rejected", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("process.exit");
		}) as never);
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "reject",
			reason: "needs repro steps",
			comments: [{ quote: "File a bug", note: "which bug?" }],
		});

		await expect(propose({ json: writePayload(bug) })).rejects.toThrow(
			"process.exit",
		);

		const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain("needs repro steps");
		expect(output).toContain("> File a bug");
		expect(output).toContain("which bug?");
		expect(await allItems()).toEqual([]);
	});

	it("refuses --confirmed so the flag cannot bypass the pane", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		claudeCode = true;

		await propose({ json: writePayload(bug), confirmed: true });

		expect(process.exitCode).toBe(1);
		expect(errorSpy.mock.calls.map((c) => c.join(" ")).join("\n")).toContain(
			"preview pane is the gate",
		);
		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(await allItems()).toEqual([]);
	});
});
