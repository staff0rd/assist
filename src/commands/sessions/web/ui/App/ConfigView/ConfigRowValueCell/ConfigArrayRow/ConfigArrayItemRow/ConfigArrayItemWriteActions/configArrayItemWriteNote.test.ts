import { describe, expect, it } from "vitest";
import { configArrayItemWriteNote } from "./configArrayItemWriteNote";

const base = {
	key: "run",
	ownerScope: undefined,
	arrayOwnerScope: undefined,
	repoKey: "assist",
} as const;

describe("configArrayItemWriteNote", () => {
	it("says nothing when the item is saved back to its own scope", () => {
		expect(
			configArrayItemWriteNote({
				...base,
				ownerScope: "project",
				targetScope: "project",
			}),
		).toBeUndefined();
	});

	it("says nothing for a new item", () => {
		expect(
			configArrayItemWriteNote({ ...base, targetScope: "repo" }),
		).toBeUndefined();
	});

	it("names the winner when a keyed entry is saved to another scope", () => {
		expect(
			configArrayItemWriteNote({
				...base,
				ownerScope: "project",
				targetScope: "global",
			}),
		).toBe(
			"Both this repo's assist.yml and ~/.assist.yml will define this entry — Project wins.",
		);
	});

	it("warns that a concatenated entry ends up duplicated", () => {
		expect(
			configArrayItemWriteNote({
				...base,
				key: "subtasks",
				ownerScope: "global",
				targetScope: "project",
			}),
		).toBe(
			"subtasks concatenates across scopes — the entry in ~/.assist.yml stays, so both will apply.",
		);
	});

	it("warns that an unmerged key replaces the lower scope wholesale", () => {
		expect(
			configArrayItemWriteNote({
				...base,
				key: "sql.connections",
				arrayOwnerScope: "global",
				ownerScope: "global",
				targetScope: "project",
			}),
		).toBe(
			"sql.connections is not merged across scopes — saving here replaces the entries in ~/.assist.yml.",
		);
	});

	it("warns that a write below an unmerged key has no effect", () => {
		expect(
			configArrayItemWriteNote({
				...base,
				key: "sql.connections",
				arrayOwnerScope: "project",
				ownerScope: "project",
				targetScope: "global",
			}),
		).toBe(
			"this repo's assist.yml sets sql.connections and replaces lower scopes — this copy will have no effect.",
		);
	});
});
