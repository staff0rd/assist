import { type SpawnSyncReturns, spawnSync } from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../test/mocks/childProcessMock";
import type * as fsMockModule from "../test/mocks/fsMock";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);
vi.mock("node:fs", async () =>
	(await vi.importActual<typeof fsMockModule>("../test/mocks/fsMock")).fsMock(),
);

import { runGhGraphql } from "./runGhGraphql";

const mockSpawnSync = vi.mocked(spawnSync);

const reply = (result: Partial<SpawnSyncReturns<string>>) =>
	result as SpawnSyncReturns<string>;

afterEach(() => {
	mockSpawnSync.mockReset();
});

describe("runGhGraphql", () => {
	it("throws when the subprocess exits non-zero", () => {
		mockSpawnSync.mockReturnValue(
			reply({ status: 1, stderr: "boom", stdout: "" }),
		);
		expect(() => runGhGraphql("mutation", {})).toThrow("boom");
	});

	it("throws when the response carries a GraphQL errors array", () => {
		mockSpawnSync.mockReturnValue(
			reply({
				status: 0,
				stdout: JSON.stringify({
					data: null,
					errors: [{ message: "line not part of the diff" }],
				}),
			}),
		);
		expect(() => runGhGraphql("mutation", {})).toThrow(
			"line not part of the diff",
		);
	});

	it("returns stdout when there are no errors", () => {
		const stdout = JSON.stringify({ data: { ok: true } });
		mockSpawnSync.mockReturnValue(reply({ status: 0, stdout }));
		expect(runGhGraphql("mutation", {})).toBe(stdout);
	});

	it("tolerates non-JSON stdout", () => {
		mockSpawnSync.mockReturnValue(reply({ status: 0, stdout: "not json" }));
		expect(runGhGraphql("mutation", {})).toBe("not json");
	});
});
