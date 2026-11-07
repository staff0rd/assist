import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("./spawnClaude", () => ({ spawnClaude: vi.fn() }));
vi.mock("./spawnCodex", () => ({ spawnCodex: vi.fn() }));
vi.mock("./spawnPi", () => ({ spawnPi: vi.fn() }));

import { spawnClaude } from "./spawnClaude";
import { spawnCodex } from "./spawnCodex";
import { spawnHarness } from "./spawnHarness";
import { spawnPi } from "./spawnPi";

const mockSpawnClaude = spawnClaude as unknown as MockInstance;
const mockSpawnCodex = spawnCodex as unknown as MockInstance;
const mockSpawnPi = spawnPi as unknown as MockInstance;

describe("spawnHarness", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("launches claude with edit permissions and session ids", () => {
		spawnHarness("claude", "/refine a279", {
			sessionId: "s-1",
			resumeSessionId: "r-1",
			cwd: "/repo",
		});

		expect(mockSpawnClaude).toHaveBeenCalledWith("/refine a279", {
			allowEdits: true,
			sessionId: "s-1",
			resumeSessionId: "r-1",
		});
		expect(mockSpawnCodex).not.toHaveBeenCalled();
	});

	it("preserves read-only Claude launch behavior", () => {
		spawnHarness("claude", "/refine a279", { allowEdits: false });

		expect(mockSpawnClaude).toHaveBeenCalledWith("/refine a279", {
			allowEdits: false,
			sessionId: undefined,
			resumeSessionId: undefined,
		});
	});

	it("launches codex in the given cwd", () => {
		spawnHarness("codex", "/refine a279", { cwd: "/repo", sessionId: "s-1" });

		expect(mockSpawnCodex).toHaveBeenCalledWith("/refine a279", {
			cwd: "/repo",
			sandbox: "workspace-write",
		});
		expect(mockSpawnClaude).not.toHaveBeenCalled();
		expect(mockSpawnPi).not.toHaveBeenCalled();
	});

	it("passes the resumed conversation to codex", () => {
		spawnHarness("codex", "Continue", { cwd: "/repo", resumeSessionId: "c-1" });

		expect(mockSpawnCodex).toHaveBeenCalledWith("Continue", {
			cwd: "/repo",
			sandbox: "workspace-write",
			resumeSessionId: "c-1",
		});
	});

	it("maps disabled edits to the Codex read-only sandbox", () => {
		spawnHarness("codex", "/refine a279", {
			allowEdits: false,
			cwd: "/repo",
		});

		expect(mockSpawnCodex).toHaveBeenCalledWith("/refine a279", {
			cwd: "/repo",
			sandbox: "read-only",
		});
	});

	it("launches pi in the given cwd", () => {
		spawnHarness("pi", "/refine a279", { cwd: "/repo", sessionId: "s-1" });

		expect(mockSpawnPi).toHaveBeenCalledWith("/refine a279", {
			cwd: "/repo",
		});
		expect(mockSpawnClaude).not.toHaveBeenCalled();
		expect(mockSpawnCodex).not.toHaveBeenCalled();
	});
});
