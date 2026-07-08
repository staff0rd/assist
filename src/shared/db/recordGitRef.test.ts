import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { GitRef } from "../../commands/backlog/types";
import { createTestDb } from "./createTestDb";
import type { Db } from "./Db";
import { recordGitRef } from "./recordGitRef";
import { itemGitRefs, items } from "./schema";

describe("recordGitRef", () => {
	let orm: Db;
	let close: () => Promise<void>;

	beforeEach(async () => {
		({ orm, close } = await createTestDb());
		await orm.insert(items).values({ id: 1, origin: "test", name: "Item" });
	});

	afterEach(async () => {
		await close();
	});

	const rows = () =>
		orm.select().from(itemGitRefs).orderBy(itemGitRefs.kind, itemGitRefs.ref);

	it("records a branch, commit, and PR ref", async () => {
		const refs: GitRef[] = [
			{ kind: "branch", ref: "feature", url: "https://example/tree/feature" },
			{ kind: "commit", ref: "abc123", title: "Do the thing" },
			{ kind: "pr", ref: "42", title: "My PR", state: "OPEN" },
		];

		for (const ref of refs) await recordGitRef(orm, 1, ref);

		expect((await rows()).map((r) => `${r.kind}:${r.ref}`)).toEqual([
			"branch:feature",
			"commit:abc123",
			"pr:42",
		]);
	});

	it("does not duplicate rows when the same ref is recorded again", async () => {
		const ref: GitRef = { kind: "commit", ref: "abc123", title: "First" };

		await recordGitRef(orm, 1, ref);
		await recordGitRef(orm, 1, ref);
		await recordGitRef(orm, 1, ref);

		expect(await rows()).toHaveLength(1);
	});

	it("updates the stored fields in place on re-record", async () => {
		await recordGitRef(orm, 1, { kind: "pr", ref: "42", state: "OPEN" });
		await recordGitRef(orm, 1, {
			kind: "pr",
			ref: "42",
			title: "Now titled",
			state: "MERGED",
		});

		const all = await rows();
		expect(all).toHaveLength(1);
		expect(all[0].title).toBe("Now titled");
		expect(all[0].state).toBe("MERGED");
	});

	it("keeps refs of different kinds with the same ref value distinct", async () => {
		await recordGitRef(orm, 1, { kind: "branch", ref: "42" });
		await recordGitRef(orm, 1, { kind: "pr", ref: "42" });

		expect(await rows()).toHaveLength(2);
	});
});
