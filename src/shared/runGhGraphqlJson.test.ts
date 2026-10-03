import { type SpawnSyncReturns, spawnSync } from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../test/mocks/childProcessMock";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

import { runGhGraphqlJson } from "./runGhGraphqlJson";

const mockSpawnSync = vi.mocked(spawnSync);

const reply = (result: Partial<SpawnSyncReturns<string>>) =>
	result as SpawnSyncReturns<string>;

afterEach(() => {
	mockSpawnSync.mockReset();
});

describe("runGhGraphqlJson", () => {
	it("passes the query and list variables as a JSON body on stdin", () => {
		mockSpawnSync.mockReturnValue(reply({ status: 0, stdout: "{}" }));
		runGhGraphqlJson("query($ids: [ID!]!) { nodes(ids: $ids) { id } }", {
			ids: ["a", "b"],
		});
		const [command, args, options] = mockSpawnSync.mock.calls[0];
		expect(command).toBe("gh");
		expect(args).toEqual(["api", "graphql", "--input", "-"]);
		expect(JSON.parse(String(options?.input))).toEqual({
			query: "query($ids: [ID!]!) { nodes(ids: $ids) { id } }",
			variables: { ids: ["a", "b"] },
		});
	});

	it("throws when the subprocess exits non-zero", () => {
		mockSpawnSync.mockReturnValue(
			reply({ status: 1, stderr: "boom", stdout: "" }),
		);
		expect(() => runGhGraphqlJson("query")).toThrow("boom");
	});

	it("throws when the response carries a GraphQL errors array", () => {
		mockSpawnSync.mockReturnValue(
			reply({
				status: 0,
				stdout: JSON.stringify({
					data: null,
					errors: [{ message: "exceeds the node limit" }],
				}),
			}),
		);
		expect(() => runGhGraphqlJson("query")).toThrow("exceeds the node limit");
	});

	it("returns stdout when there are no errors", () => {
		const stdout = JSON.stringify({ data: { nodes: [] } });
		mockSpawnSync.mockReturnValue(reply({ status: 0, stdout }));
		expect(runGhGraphqlJson("query")).toBe(stdout);
	});
});
