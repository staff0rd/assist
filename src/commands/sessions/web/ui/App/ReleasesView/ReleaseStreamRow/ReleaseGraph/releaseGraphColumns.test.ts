import { describe, expect, it } from "vitest";
import type { ReleaseNodeState } from "../../../../../releases/types";
import { releaseGraphColumns } from "./releaseGraphColumns";

function node(id: string): ReleaseNodeState {
	return {
		id,
		kind: "environment",
		environment: id,
		label: id,
		live: null,
		deployedAt: null,
		behind: null,
		queued: null,
		run: null,
	};
}

const ids = (columns: ReleaseNodeState[][]) =>
	columns.map((column) => column.map((n) => n.id));

describe("releaseGraphColumns", () => {
	it("puts a node with no incoming edge in the first column", () => {
		const columns = releaseGraphColumns(
			[node("build"), node("dev")],
			[["build", "dev"]],
		);

		expect(ids(columns)).toEqual([["build"], ["dev"]]);
	});

	it("fans out siblings into one column", () => {
		const columns = releaseGraphColumns(
			[node("dev"), node("eu-staging"), node("ap-staging")],
			[
				["dev", "eu-staging"],
				["dev", "ap-staging"],
			],
		);

		expect(ids(columns)).toEqual([["dev"], ["eu-staging", "ap-staging"]]);
	});

	it("puts a fan-in gate past its deepest input", () => {
		const columns = releaseGraphColumns(
			[node("build"), node("dev"), node("staging"), node("promote")],
			[
				["build", "dev"],
				["dev", "staging"],
				["build", "promote"],
				["staging", "promote"],
			],
		);

		expect(ids(columns)).toEqual([
			["build"],
			["dev"],
			["staging"],
			["promote"],
		]);
	});

	it("keeps a node no edge mentions in the first column", () => {
		const columns = releaseGraphColumns([node("loose"), node("dev")], []);

		expect(ids(columns)).toEqual([["loose", "dev"]]);
	});

	it("survives a cycle rather than recursing forever", () => {
		const columns = releaseGraphColumns(
			[node("a"), node("b")],
			[
				["a", "b"],
				["b", "a"],
			],
		);

		expect(columns.flat()).toHaveLength(2);
	});
});
