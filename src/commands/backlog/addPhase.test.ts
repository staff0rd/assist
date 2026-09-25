import { asc, eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { items, planPhases } from "../../shared/db/schema";
import { addPhase } from "./addPhase";

let orm: Db;
let close: () => Promise<void>;
let claudeCode = false;

const mockRequestPreviewDecision = vi.fn();

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
}));

vi.mock("./ensureRemoteOrigin", () => ({
	ensureRemoteOrigin: () => true,
}));

vi.mock("../../lib/isClaudeCode", () => ({
	isClaudeCode: () => claudeCode,
}));

vi.mock("../sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (...args: unknown[]) =>
		mockRequestPreviewDecision(...args),
}));

vi.mock("./shared", () => ({
	getOrigin: () => "test",
	findOneItem: () => ({
		orm,
		item: { id: 1, name: "Preview items", type: "story", status: "todo" },
	}),
}));

function getPhases() {
	return orm
		.select({ idx: planPhases.idx, name: planPhases.name })
		.from(planPhases)
		.where(eq(planPhases.itemId, 1))
		.orderBy(asc(planPhases.idx));
}

beforeEach(async () => {
	({ orm, close } = await createTestDb());
	await orm
		.insert(items)
		.values({ id: 1, origin: "test", name: "Preview items", status: "todo" });
	claudeCode = false;
	mockRequestPreviewDecision.mockReset();
	vi.spyOn(console, "log").mockImplementation(() => {});
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

afterEach(async () => {
	await close();
	vi.restoreAllMocks();
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

describe("add-phase", () => {
	it("writes the phase without a preview for a human invocation", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "7";

		await addPhase("a1", "Close the bypass paths", { task: ["Block add"] });

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(await getPhases()).toEqual([
			{ idx: 0, name: "Close the bypass paths" },
		]);
	});

	it("writes the phase without a preview for an agent outside a web session", async () => {
		claudeCode = true;

		await addPhase("a1", "Close the bypass paths", { task: ["Block add"] });

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(await getPhases()).toEqual([
			{ idx: 0, name: "Close the bypass paths" },
		]);
	});

	it("previews the phase for an agent in a web session and writes it on approval", async () => {
		claudeCode = true;
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "7";
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await addPhase("a1", "Close the bypass paths", {
			task: ["Block add", "Gate add-phase"],
			manualCheck: ["Reject once, then approve"],
		});

		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				sessionId: "7",
				title: "Add a phase to a1: Preview items",
				kind: "backlog-item",
				itemType: "story",
				prNumber: null,
			}),
		);
		const body = mockRequestPreviewDecision.mock.calls[0][0].body as string;
		expect(body).toContain("### Phase 1: Close the bypass paths");
		expect(body).toContain("- Gate add-phase");
		expect(body).toContain("**Manual checks:**");
		expect(body).toContain("- Reject once, then approve");
		expect(await getPhases()).toEqual([
			{ idx: 0, name: "Close the bypass paths" },
		]);
	});

	it("exits non-zero without writing the phase when the preview is rejected", async () => {
		claudeCode = true;
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "7";
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("process.exit");
		}) as never);
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "reject",
			reason: "not this item",
			comments: [{ quote: "Block add", note: "already done" }],
		});

		await expect(
			addPhase("a1", "Close the bypass paths", { task: ["Block add"] }),
		).rejects.toThrow("process.exit");

		const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain("not this item");
		expect(output).toContain("> Block add");
		expect(output).toContain("already done");
		expect(await getPhases()).toEqual([]);
	});
});
