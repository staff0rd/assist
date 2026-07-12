import { describe, expect, it } from "vitest";
import { checkDestructive } from "./checkDestructive";

describe("checkDestructive", () => {
	describe("when a migration only adds tables and columns", () => {
		it("returns no findings", () => {
			expect(
				checkDestructive([
					{
						id: 1,
						name: "baseline",
						sql: "CREATE TABLE items (id INTEGER); ALTER TABLE items ADD COLUMN name TEXT;",
					},
				]),
			).toEqual([]);
		});
	});

	describe("when a migration drops a column without the marker", () => {
		it("flags the migration and the matched statement", () => {
			expect(
				checkDestructive([
					{ id: 2, name: "trim", sql: "ALTER TABLE items DROP COLUMN old;" },
				]),
			).toEqual([{ id: 2, name: "trim", statements: ["DROP COLUMN"] }]);
		});
	});

	describe("when a migration drops a table or renames a column", () => {
		it("flags each destructive keyword", () => {
			expect(
				checkDestructive([
					{
						id: 3,
						name: "cleanup",
						sql: "DROP TABLE legacy; ALTER TABLE items RENAME COLUMN a TO b;",
					},
				]),
			).toEqual([
				{ id: 3, name: "cleanup", statements: ["DROP TABLE", "RENAME COLUMN"] },
			]);
		});
	});

	describe("when the acknowledgement marker is present", () => {
		it("allows the destructive statement", () => {
			expect(
				checkDestructive([
					{
						id: 4,
						name: "trim",
						sql: "-- destructive-ok: column unused since migration 3\nALTER TABLE items DROP COLUMN old;",
					},
				]),
			).toEqual([]);
		});
	});

	describe("when dropping a constraint (not a table or column)", () => {
		it("does not flag it", () => {
			expect(
				checkDestructive([
					{
						id: 5,
						name: "rekey",
						sql: "ALTER TABLE usage_peaks DROP CONSTRAINT usage_peaks_pkey;",
					},
				]),
			).toEqual([]);
		});
	});
});
