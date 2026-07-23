import { eq } from "drizzle-orm";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("../shared", () => ({
	findOneItem: vi.fn(),
	getOrigin: vi.fn(),
}));

import { createTestDb } from "../../../shared/db/createTestDb";
import type { Db } from "../../../shared/db/Db";
import { items } from "../../../shared/db/schema";
import { findOneItem, getOrigin } from "../shared";
import { update } from "./update";

const mockFindOneItem = findOneItem as unknown as MockInstance;
const mockGetOrigin = getOrigin as unknown as MockInstance;

let orm: Db;
let close: () => Promise<void>;

const HERE = "github.com/acme/space-glob-factory";
const THERE = "github.com/acme/asteroid-logistics";

async function rowById(id: number) {
	const [row] = await orm.select().from(items).where(eq(items.id, id));
	return row;
}

describe("update --origin", () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		process.exitCode = undefined;
		mockGetOrigin.mockReturnValue(HERE);
		({ orm, close } = await createTestDb());
		await orm.insert(items).values([
			{ id: 1, origin: HERE, name: "A", status: "todo" },
			{ id: 2, origin: HERE, name: "B", status: "todo" },
		]);
		mockFindOneItem.mockImplementation(async (id: string) => {
			const [row] = await orm
				.select()
				.from(items)
				.where(eq(items.id, Number(id)));
			return row
				? { orm, item: { ...row, acceptanceCriteria: [] } }
				: undefined;
		});
	});

	afterEach(async () => {
		process.exitCode = undefined;
		await close();
	});

	it("retags exactly the target item to the normalized origin", async () => {
		await update("1", { origin: `https://${THERE}.git` });

		expect((await rowById(1)).origin).toBe(THERE);
		expect((await rowById(2)).origin).toBe(HERE);
		expect(process.exitCode).toBeUndefined();
	});

	it("defaults --origin with no value to the current repo origin", async () => {
		mockGetOrigin.mockReturnValue(THERE);

		await update("1", { origin: true });

		expect(mockGetOrigin).toHaveBeenCalled();
		expect((await rowById(1)).origin).toBe(THERE);
		expect((await rowById(2)).origin).toBe(HERE);
		expect(process.exitCode).toBeUndefined();
	});

	it("is a no-op with a clear message when already on the target origin", async () => {
		const consoleSpy = vi.spyOn(console, "log");

		await update("1", { origin: `https://${HERE}.git` });

		const output = consoleSpy.mock.calls.map((c) => c[0]).join("\n");
		expect(output).toContain("already on origin");
		expect((await rowById(1)).origin).toBe(HERE);
		expect(process.exitCode).toBeUndefined();
		consoleSpy.mockRestore();
	});

	it("combines --origin with other flags in one write", async () => {
		await update("1", { name: "Renamed", origin: THERE });

		const row = await rowById(1);
		expect(row.origin).toBe(THERE);
		expect(row.name).toBe("Renamed");
	});
});
