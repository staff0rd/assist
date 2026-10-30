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
			"Both this repo's assist.yml and ~/.assist.yml (this node only) will define this entry — repo (git) wins.",
		);
	});

	it("ranks the user db below every other scope", () => {
		expect(
			configArrayItemWriteNote({
				...base,
				ownerScope: "user",
				targetScope: "global",
			}),
		).toBe(
			"Both the shared db (every repo, all nodes) and ~/.assist.yml (this node only) will define this entry — user (node) wins.",
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
			"sql.connections is not merged across scopes — saving here replaces the entries in ~/.assist.yml (this node only).",
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
