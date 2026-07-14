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

import { spawnClaude } from "./spawnClaude";
import { spawnCodex } from "./spawnCodex";
import { spawnHarness } from "./spawnHarness";

const mockSpawnClaude = spawnClaude as unknown as MockInstance;
const mockSpawnCodex = spawnCodex as unknown as MockInstance;

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

	it("launches codex in the given cwd", () => {
		spawnHarness("codex", "/refine a279", { cwd: "/repo", sessionId: "s-1" });

		expect(mockSpawnCodex).toHaveBeenCalledWith("/refine a279", {
			cwd: "/repo",
		});
		expect(mockSpawnClaude).not.toHaveBeenCalled();
	});
});
