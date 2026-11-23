import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("./shared", () => ({
	findOneItem: vi.fn(),
}));

vi.mock("./updateStatus", () => ({
	updateStatus: vi.fn(),
}));

vi.mock("./appendComment", () => ({
	appendComment: vi.fn(),
}));

vi.mock("../sessions/daemon/sendToDaemonAwaitAck", () => ({
	sendToDaemonAwaitAck: vi.fn(),
}));

vi.mock("../sessions/daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));

import { sendToDaemonAwaitAck } from "../sessions/daemon/sendToDaemonAwaitAck";
import { appendComment } from "./appendComment";
import { clearSignalOwner, recordSignalOwner } from "./recordSignalOwner";
import { findOneItem } from "./shared";
import { updateStatus } from "./updateStatus";
import { done } from "./done";

const mockFindOneItem = findOneItem as unknown as MockInstance;
const mockUpdateStatus = updateStatus as unknown as MockInstance;
const mockAppendComment = appendComment as unknown as MockInstance;
const mockSend = sendToDaemonAwaitAck as unknown as MockInstance;

const orm = {} as never;

function found(item: any) {
	return { orm, item };
}

describe("done", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		process.exitCode = undefined;
	});

	it("should mark an item without a plan as done", async () => {
		const item = { id: 1, name: "Task", status: "in-progress" };
		mockFindOneItem.mockResolvedValue(found(item));

		await done("1");

		expect(mockUpdateStatus).toHaveBeenCalledWith(orm, 1, "done");
	});

	it("refuses an item with a why line until its Delivered line is recorded", async () => {
		const why = { text: "Predicts +3k/h", timestamp: "t", type: "why" };
		const item = {
			id: 1,
			name: "Task",
			status: "in-progress",
			comments: [why],
		};
		mockFindOneItem.mockResolvedValue(found(item));
		vi.spyOn(console, "log").mockImplementation(() => {});

		await done("1");
		expect(mockUpdateStatus).not.toHaveBeenCalled();
		expect(process.exitCode).toBe(1);

		item.comments.push({ text: "It works", timestamp: "t", type: "delivered" });
		await done("1");
		expect(mockUpdateStatus).toHaveBeenCalledWith(orm, 1, "done");
	});

	it("should mark an item with all phases completed as done", async () => {
		const item = {
			id: 1,
			name: "Task",
			status: "in-progress",
			plan: [{ name: "Phase 1", tasks: [] }],
			currentPhase: 2,
		};
		mockFindOneItem.mockResolvedValue(found(item));

		await done("1");

		expect(mockUpdateStatus).toHaveBeenCalledWith(orm, 1, "done");
	});

	it("should reject completion when phases are pending", async () => {
		const item = {
			id: 1,
			name: "Task",
			status: "in-progress",
			plan: [
				{ name: "Implement", tasks: [] },
				{ name: "Review", tasks: [] },
			],
			currentPhase: 1,
		};
		mockFindOneItem.mockResolvedValue(found(item));

		await done("1");

		expect(mockUpdateStatus).not.toHaveBeenCalled();
		expect(process.exitCode).toBe(1);
	});

	it("should list pending phase names", async () => {
		const consoleSpy = vi.spyOn(console, "log");
		const item = {
			id: 1,
			name: "Task",
			status: "in-progress",
			plan: [
				{ name: "Implement", tasks: [] },
				{ name: "Review", tasks: [] },
				{ name: "Deploy", tasks: [] },
			],
			currentPhase: 2,
		};
		mockFindOneItem.mockResolvedValue(found(item));

		await done("1");

		const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
		expect(output).toContain("Review");
		expect(output).toContain("Deploy");
		expect(output).toContain("2 pending phase(s)");
		consoleSpy.mockRestore();
	});

	it("should treat missing currentPhase as 0 phases completed", async () => {
		const item = {
			id: 1,
			name: "Task",
			status: "in-progress",
			plan: [{ name: "Phase 1", tasks: [] }],
		};
		mockFindOneItem.mockResolvedValue(found(item));

		await done("1");

		expect(mockUpdateStatus).not.toHaveBeenCalled();
		expect(process.exitCode).toBe(1);
	});

	it("should store a phase summary when provided", async () => {
		const item = {
			id: 1,
			name: "Task",
			status: "in-progress",
			currentPhase: 3,
			plan: [
				{ name: "A", tasks: [] },
				{ name: "B", tasks: [] },
			],
		};
		mockFindOneItem.mockResolvedValue(found(item));

		await done("1", "All done");

		expect(mockAppendComment).toHaveBeenCalledWith(orm, 1, "All done", {
			phase: 3,
			type: "summary",
		});
	});

	describe("with a run owning the item", () => {
		beforeEach(() => {
			process.env.ASSIST_SESSION_ID = "run-session";
			recordSignalOwner(1);
			process.env.ASSIST_SESSION_ID = "other-session";
			mockFindOneItem.mockResolvedValue(
				found({ id: 1, name: "Task", status: "in-progress" }),
			);
		});

		afterEach(() => {
			clearSignalOwner(1);
			delete process.env.ASSIST_SESSION_ID;
		});

		it("should close the previews of the run's session", async () => {
			await done("1");

			expect(mockSend).toHaveBeenCalledWith({
				type: "close-previews",
				sessionId: "run-session",
				reason: "item done",
			});
		});

		it("should still complete when the daemon is unreachable", async () => {
			mockSend.mockRejectedValue(new Error("connect ENOENT"));

			await expect(done("1")).resolves.toBeUndefined();

			expect(mockUpdateStatus).toHaveBeenCalledWith(orm, 1, "done");
			expect(process.exitCode).toBeUndefined();
		});
	});

	it("should not close previews when no run owns the item", async () => {
		clearSignalOwner(1);
		mockFindOneItem.mockResolvedValue(
			found({ id: 1, name: "Task", status: "in-progress" }),
		);

		await done("1");

		expect(mockSend).not.toHaveBeenCalled();
	});

	it("should allow completion with an empty plan", async () => {
		const item = { id: 1, name: "Task", status: "in-progress", plan: [] };
		mockFindOneItem.mockResolvedValue(found(item));

		await done("1");

		expect(mockUpdateStatus).toHaveBeenCalledWith(orm, 1, "done");
	});
});
