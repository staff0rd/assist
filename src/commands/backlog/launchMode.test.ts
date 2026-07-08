import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("node:crypto", () => ({
	randomUUID: vi.fn(() => "generated-uuid"),
}));

vi.mock("../../shared/pullIfConfigured", () => ({
	pullIfConfigured: vi.fn(),
}));

vi.mock("../../shared/spawnClaude", () => ({
	spawnClaude: vi.fn(),
}));

vi.mock("./next", () => ({
	next: vi.fn(),
}));

vi.mock("./readSignal", () => ({
	readSignal: vi.fn(),
}));

vi.mock("./resolvePhaseResult", () => ({
	cleanupSignal: vi.fn(),
}));

vi.mock("./tryRunById", () => ({
	tryRunById: vi.fn(),
}));

vi.mock("./loadItem", () => ({
	loadItem: vi.fn(),
}));

vi.mock("./shared", () => ({
	getReady: vi.fn().mockResolvedValue({ orm: {} }),
}));

vi.mock("../../shared/emitActivity", () => ({
	emitActivity: vi.fn(),
}));

vi.mock("./watchForMarker", () => ({
	watchForMarker: vi.fn(),
	stopWatching: vi.fn(),
}));

import { emitActivity } from "../../shared/emitActivity";
import { spawnClaude } from "../../shared/spawnClaude";
import { buildSlashCommand, launchMode } from "./launchMode";
import { loadItem } from "./loadItem";
import { next } from "./next";
import { readSignal } from "./readSignal";
import { tryRunById } from "./tryRunById";
import { watchForMarker } from "./watchForMarker";

const mockSpawnClaude = spawnClaude as unknown as MockInstance;
const mockNext = next as unknown as MockInstance;
const mockReadSignal = readSignal as unknown as MockInstance;
const mockTryRunById = tryRunById as unknown as MockInstance;
const mockWatchForMarker = watchForMarker as unknown as MockInstance;
const mockLoadItem = loadItem as unknown as MockInstance;
const mockEmitActivity = emitActivity as unknown as MockInstance;

const child = { kill: vi.fn() };

describe("buildSlashCommand", () => {
	it("appends a trimmed description to the slash command", () => {
		expect(buildSlashCommand("draft", "this is broken")).toBe(
			"/draft this is broken",
		);
		expect(buildSlashCommand("bug", "  spaced out  ")).toBe("/bug spaced out");
	});

	it("returns the plain slash command when no description is given", () => {
		expect(buildSlashCommand("draft")).toBe("/draft");
		expect(buildSlashCommand("bug", "")).toBe("/bug");
		expect(buildSlashCommand("draft", "   ")).toBe("/draft");
	});
});

describe("launchMode", () => {
	beforeEach(() => {
		delete process.env.ASSIST_RESUME_IDLE;
		vi.clearAllMocks();
		mockSpawnClaude.mockReturnValue({ child, done: Promise.resolve(0) });
		mockWatchForMarker.mockReturnValue({ killedOnMarker: () => false });
	});

	it("forwards the description to the spawned slash command", async () => {
		await launchMode("bug", { description: "this is broken" });

		expect(mockSpawnClaude).toHaveBeenCalledWith("/bug this is broken", {
			allowEdits: true,
			sessionId: "generated-uuid",
		});
	});

	it("spawns a plain slash command when no description is given", async () => {
		await launchMode("draft");

		expect(mockSpawnClaude).toHaveBeenCalledWith("/draft", {
			allowEdits: true,
			sessionId: "generated-uuid",
		});
	});

	it("reports the assigned claude session id on the command activity", async () => {
		await launchMode("draft");

		expect(mockEmitActivity).toHaveBeenCalledWith(
			expect.objectContaining({ claudeSessionId: "generated-uuid" }),
		);
	});

	it("emits the item id and name on the command activity when given", async () => {
		await launchMode("refine 254", {
			itemId: 254,
			itemName: "Add refine mode button",
		});

		expect(mockEmitActivity).toHaveBeenCalledWith({
			kind: "command",
			name: "refine 254",
			itemId: 254,
			itemName: "Add refine mode button",
			claudeSessionId: "generated-uuid",
		});
	});

	describe("when resuming an interrupted session", () => {
		it("resumes the conversation with a nudge prompt and re-establishes the watcher", async () => {
			await launchMode("draft", {
				once: true,
				description: "ignored on resume",
				resumeSessionId: "draft-456",
			});

			expect(mockSpawnClaude).toHaveBeenCalledWith(
				"A restart interrupted this conversation. Continue from where you left off.",
				{
					allowEdits: true,
					sessionId: "draft-456",
					resumeSessionId: "draft-456",
				},
			);
			expect(mockWatchForMarker).toHaveBeenCalledWith(child, {
				actOnDone: true,
			});
			expect(mockEmitActivity).toHaveBeenCalledWith(
				expect.objectContaining({ claudeSessionId: "draft-456" }),
			);
		});
	});

	describe("when launched in once mode", () => {
		it("tells the watcher to act on done signals", async () => {
			await launchMode("draft", { once: true });

			expect(mockWatchForMarker).toHaveBeenCalledWith(child, {
				actOnDone: true,
			});
		});

		it("exits without chaining when a done signal arrives", async () => {
			mockReadSignal.mockReturnValue({ event: "done" });

			await launchMode("draft", { once: true });

			expect(mockNext).not.toHaveBeenCalled();
			expect(mockTryRunById).not.toHaveBeenCalled();
		});

		it("passes once through to next when a next signal arrives", async () => {
			mockReadSignal.mockReturnValue({ event: "next" });

			await launchMode("draft", { once: true });

			expect(mockNext).toHaveBeenCalledWith({ allowEdits: true, once: true });
		});
	});

	describe("when launched without once", () => {
		it("tells the watcher to ignore done signals", async () => {
			await launchMode("draft");

			expect(mockWatchForMarker).toHaveBeenCalledWith(child, {
				actOnDone: undefined,
			});
		});

		it("stays open until the session ends, then exits without chaining on a stale done signal", async () => {
			mockReadSignal.mockReturnValue({ event: "done" });

			await launchMode("bug");

			expect(mockNext).not.toHaveBeenCalled();
		});

		it("chains into next without once on a next signal", async () => {
			mockReadSignal.mockReturnValue({ event: "next" });

			await launchMode("bug");

			expect(mockNext).toHaveBeenCalledWith({
				allowEdits: true,
				once: undefined,
			});
		});
	});

	describe("when a done signal carries a created item id", () => {
		it("surfaces the item as activity and does not chain", async () => {
			mockReadSignal.mockReturnValue({ event: "done", id: "42" });
			mockLoadItem.mockResolvedValue({ id: 42, name: "Shiny feature" });

			await launchMode("draft", { once: true });

			expect(mockLoadItem).toHaveBeenCalledWith({}, 42);
			expect(mockEmitActivity).toHaveBeenCalledWith({
				kind: "command",
				name: "draft",
				itemId: 42,
				itemName: "Shiny feature",
			});
			expect(mockNext).not.toHaveBeenCalled();
			expect(mockTryRunById).not.toHaveBeenCalled();
		});

		it("does not surface an item id when the item cannot be loaded", async () => {
			mockReadSignal.mockReturnValue({ event: "done", id: "99" });
			mockLoadItem.mockResolvedValue(undefined);

			await launchMode("bug", { once: true });

			expect(mockEmitActivity).not.toHaveBeenCalledWith(
				expect.objectContaining({ itemId: expect.anything() }),
			);
		});
	});

	describe("when the launched Claude exits non-zero", () => {
		it("propagates the exit code so the daemon keeps the card visible", async () => {
			mockSpawnClaude.mockReturnValue({ child, done: Promise.resolve(1) });
			const original = process.exitCode;
			try {
				await launchMode("bug", { once: true });
				expect(process.exitCode).toBe(1);
			} finally {
				process.exitCode = original;
			}
		});
	});

	describe("when the watcher killed Claude after a done marker", () => {
		it("treats the forced non-zero exit as success and does not propagate it", async () => {
			mockSpawnClaude.mockReturnValue({ child, done: Promise.resolve(143) });
			mockWatchForMarker.mockReturnValue({ killedOnMarker: () => true });
			const original = process.exitCode;
			try {
				await launchMode("draft", { once: true });
				expect(process.exitCode).toBe(original);
			} finally {
				process.exitCode = original;
			}
		});
	});

	describe("when a clean exit reports code zero", () => {
		it("leaves the process exit code untouched", async () => {
			mockSpawnClaude.mockReturnValue({ child, done: Promise.resolve(0) });
			const original = process.exitCode;
			await launchMode("bug", { once: true });
			expect(process.exitCode).toBe(original);
		});
	});

	describe("when the launched Claude fails to spawn", () => {
		it("does not chain into next", async () => {
			mockSpawnClaude.mockReturnValue({
				child,
				done: Promise.reject(new Error("no claude binary")),
			});
			mockReadSignal.mockReturnValue({ event: "next" });

			await launchMode("bug", { once: true });

			expect(mockNext).not.toHaveBeenCalled();
		});
	});

	describe("when a next signal carries an id", () => {
		it("runs that item directly and skips next when it succeeds", async () => {
			mockReadSignal.mockReturnValue({ event: "next", id: "7" });
			mockTryRunById.mockResolvedValue(true);

			await launchMode("draft", { once: true });

			expect(mockTryRunById).toHaveBeenCalledWith("7", { allowEdits: true });
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("falls back to next when the item cannot run", async () => {
			mockReadSignal.mockReturnValue({ event: "next", id: "7" });
			mockTryRunById.mockResolvedValue(false);

			await launchMode("draft", { once: true });

			expect(mockNext).toHaveBeenCalledWith({ allowEdits: true, once: true });
		});
	});
});
