import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { BacklogOrm } from "./BacklogOrm";
import { items as itemsTable } from "./backlogSchema";
import { createTestDb } from "./createTestDb";
import { loadAllItems } from "./loadAllItems";
import { migrateLocalBacklog } from "./migrateLocalBacklog";
import type { BacklogItem } from "./types";

const ORIGIN = "github.com/test/repo";

// Old ids (10, 20) deliberately differ from the ids a fresh DB assigns (1, 2…)
// so the id remap is observable.
const ITEMS: BacklogItem[] = [
	{
		id: 10,
		type: "story",
		name: "First",
		acceptanceCriteria: ["a"],
		status: "todo",
		comments: [
			{
				id: 99,
				text: "old comment",
				timestamp: "2026-01-01T00:00:00.000Z",
				type: "comment",
			},
		],
		links: [{ type: "relates-to", targetId: 20 }],
	},
	{
		id: 20,
		type: "bug",
		name: "Second",
		acceptanceCriteria: [],
		status: "todo",
		plan: [{ name: "Phase 1", tasks: [{ task: "do it" }] }],
	},
];

function writeJsonl(dir: string, items: BacklogItem[]): void {
	mkdirSync(join(dir, ".assist"), { recursive: true });
	writeFileSync(
		join(dir, ".assist", "backlog.jsonl"),
		`${items.map((i) => JSON.stringify(i)).join("\n")}\n`,
	);
}

describe("migrateLocalBacklog", () => {
	let orm: BacklogOrm;
	let close: () => Promise<void>;
	let dir: string;

	beforeEach(async () => {
		({ orm, close } = await createTestDb());
		dir = mkdtempSync(join(tmpdir(), "assist-migrate-"));
	});

	afterEach(async () => {
		await close();
		rmSync(dir, { recursive: true, force: true });
	});

	it("imports items with fresh global ids and remaps link targets", async () => {
		writeJsonl(dir, ITEMS);
		await migrateLocalBacklog(orm, dir, ORIGIN);

		const items = await loadAllItems(orm, ORIGIN);
		expect(items).toHaveLength(2);
		expect(items.map((i) => i.id)).not.toContain(10);
		expect(items.map((i) => i.id)).not.toContain(20);

		const first = items.find((i) => i.name === "First");
		const second = items.find((i) => i.name === "Second");
		expect(first?.links?.[0].targetId).toBe(second?.id);
	});

	it("reassigns comment ids rather than preserving per-repo ones", async () => {
		writeJsonl(dir, ITEMS);
		await migrateLocalBacklog(orm, dir, ORIGIN);
		const first = (await loadAllItems(orm, ORIGIN)).find(
			(i) => i.name === "First",
		);
		expect(first?.comments).toHaveLength(1);
		expect(first?.comments?.[0].id).not.toBe(99);
	});

	it("preserves plans, status, and acceptance criteria", async () => {
		writeJsonl(dir, ITEMS);
		await migrateLocalBacklog(orm, dir, ORIGIN);
		const items = await loadAllItems(orm, ORIGIN);
		const first = items.find((i) => i.name === "First");
		const second = items.find((i) => i.name === "Second");
		expect(first?.acceptanceCriteria).toEqual(["a"]);
		expect(second?.plan?.[0].tasks[0].task).toBe("do it");
	});

	it("renames the local jsonl to .bak so it does not re-run", async () => {
		writeJsonl(dir, ITEMS);
		await migrateLocalBacklog(orm, dir, ORIGIN);
		expect(existsSync(join(dir, ".assist", "backlog.jsonl"))).toBe(false);
		expect(existsSync(join(dir, ".assist", "backlog.jsonl.bak"))).toBe(true);

		// A second run finds no jsonl and is a no-op (no duplicate import).
		await migrateLocalBacklog(orm, dir, ORIGIN);
		expect(await loadAllItems(orm, ORIGIN)).toHaveLength(2);
	});

	it("is a no-op when there is no local jsonl", async () => {
		await migrateLocalBacklog(orm, dir, ORIGIN);
		expect(await loadAllItems(orm, ORIGIN)).toHaveLength(0);
	});

	it("skips importing (no duplicates) when the origin already has items", async () => {
		await orm.insert(itemsTable).values({
			origin: ORIGIN,
			type: "story",
			name: "Pre-existing",
			status: "todo",
		});
		writeJsonl(dir, ITEMS);
		await migrateLocalBacklog(orm, dir, ORIGIN);

		const items = await loadAllItems(orm, ORIGIN);
		expect(items).toHaveLength(1);
		expect(items[0].name).toBe("Pre-existing");
		// the local file is still archived so it does not keep re-triggering
		expect(existsSync(join(dir, ".assist", "backlog.jsonl"))).toBe(false);
		expect(existsSync(join(dir, ".assist", "backlog.jsonl.bak"))).toBe(true);
	});
});
