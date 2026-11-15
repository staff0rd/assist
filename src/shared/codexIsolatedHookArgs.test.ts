import { spawnSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	codexIsolatedHookArgs,
	resetCodexIsolatedHookArgs,
} from "./codexIsolatedHookArgs";

vi.mock("node:child_process", () => ({ spawnSync: vi.fn() }));

const spawnSyncMock = vi.mocked(spawnSync);

function codexHelp(stdout: string | null): void {
	spawnSyncMock.mockReturnValue({ stdout } as never);
}

describe("codexIsolatedHookArgs", () => {
	beforeEach(() => {
		spawnSyncMock.mockReset();
		resetCodexIsolatedHookArgs();
	});

	it("passes --no-daemon when codex --help lists it", () => {
		codexHelp("  --no-daemon  Run without the shared app-server\n");
		expect(codexIsolatedHookArgs()).toEqual(["--no-daemon"]);
		expect(spawnSyncMock).toHaveBeenCalledWith(
			"codex",
			["--help"],
			expect.objectContaining({ encoding: "utf8" }),
		);
	});

	it("passes nothing when codex --help does not list it", () => {
		codexHelp("  --no-alt-screen  Disable alternate screen\n");

		expect(codexIsolatedHookArgs()).toEqual([]);
	});

	it("passes nothing when codex cannot be run", () => {
		codexHelp(null);

		expect(codexIsolatedHookArgs()).toEqual([]);
	});

	it("probes codex only once", () => {
		codexHelp("--no-daemon");
		codexIsolatedHookArgs();
		codexIsolatedHookArgs();

		expect(spawnSyncMock).toHaveBeenCalledTimes(1);
	});
});
