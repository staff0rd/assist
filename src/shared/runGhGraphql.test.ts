import { afterEach, describe, expect, it, vi } from "vitest";

const spawnSync = vi.fn();
vi.mock("node:child_process", () => ({
	spawnSync: (...args: unknown[]) => spawnSync(...args),
}));
vi.mock("node:fs", () => ({
	writeFileSync: vi.fn(),
	unlinkSync: vi.fn(),
}));

import { runGhGraphql } from "./runGhGraphql";

afterEach(() => {
	spawnSync.mockReset();
});

describe("runGhGraphql", () => {
	it("throws when the subprocess exits non-zero", () => {
		spawnSync.mockReturnValue({ status: 1, stderr: "boom", stdout: "" });
		expect(() => runGhGraphql("mutation", {})).toThrow("boom");
	});

	it("throws when the response carries a GraphQL errors array", () => {
		spawnSync.mockReturnValue({
			status: 0,
			stdout: JSON.stringify({
				data: null,
				errors: [{ message: "line not part of the diff" }],
			}),
		});
		expect(() => runGhGraphql("mutation", {})).toThrow(
			"line not part of the diff",
		);
	});

	it("returns stdout when there are no errors", () => {
		const stdout = JSON.stringify({ data: { ok: true } });
		spawnSync.mockReturnValue({ status: 0, stdout });
		expect(runGhGraphql("mutation", {})).toBe(stdout);
	});

	it("tolerates non-JSON stdout", () => {
		spawnSync.mockReturnValue({ status: 0, stdout: "not json" });
		expect(runGhGraphql("mutation", {})).toBe("not json");
	});
});
