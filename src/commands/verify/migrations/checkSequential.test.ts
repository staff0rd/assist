import { describe, expect, it } from "vitest";
import { checkSequential, migrationFileId } from "./checkSequential";

describe("migrationFileId", () => {
	it("extracts the number from a migration filename", () => {
		expect(migrationFileId("migration0001Baseline.ts")).toBe(1);
		expect(migrationFileId("migration0012AddColumn.ts")).toBe(12);
	});

	it("ignores non-migration files", () => {
		expect(migrationFileId("index.ts")).toBeUndefined();
		expect(migrationFileId("Migration.ts")).toBeUndefined();
		expect(migrationFileId("applyMigrations.test.ts")).toBeUndefined();
		expect(migrationFileId("migration0002Foo.test.ts")).toBeUndefined();
	});
});

describe("checkSequential", () => {
	describe("when migrations are contiguous and each has a matching file", () => {
		it("returns no problems", () => {
			expect(
				checkSequential(
					[
						{ id: 1, name: "baseline" },
						{ id: 2, name: "add-thing" },
					],
					["migration0001Baseline.ts", "migration0002AddThing.ts"],
				),
			).toEqual([]);
		});
	});

	describe("when a registered id breaks the 1..N sequence", () => {
		it("flags the out-of-order position", () => {
			const problems = checkSequential(
				[
					{ id: 1, name: "baseline" },
					{ id: 3, name: "skipped" },
				],
				["migration0001Baseline.ts", "migration0003Skipped.ts"],
			);
			expect(problems).toContain(
				"Registered migrations must be numbered 1..N in ascending order; index.ts position 1 has id 3, expected 2.",
			);
		});
	});

	describe("when migrations are registered out of order", () => {
		it("flags the first offending position", () => {
			const problems = checkSequential(
				[
					{ id: 2, name: "second" },
					{ id: 1, name: "first" },
				],
				["migration0001First.ts", "migration0002Second.ts"],
			);
			expect(problems[0]).toContain("position 0 has id 2, expected 1");
		});
	});

	describe("when a registered migration has no file", () => {
		it("flags the missing file", () => {
			const problems = checkSequential([{ id: 1, name: "baseline" }], []);
			expect(problems).toContain(
				"Migration 1 is registered but has no migration file.",
			);
		});
	});

	describe("when a migration file is not registered", () => {
		it("flags the orphaned file", () => {
			const problems = checkSequential(
				[{ id: 1, name: "baseline" }],
				["migration0001Baseline.ts", "migration0002Orphan.ts"],
			);
			expect(problems).toContain(
				"A migration file is numbered 2 but no migration with that id is registered in index.ts.",
			);
		});
	});

	describe("when two files share a number", () => {
		it("flags the collision", () => {
			const problems = checkSequential(
				[{ id: 1, name: "baseline" }],
				["migration0001Baseline.ts", "migration0001Duplicate.ts"],
			);
			expect(problems).toContain("Two migration files share the same number.");
		});
	});
});
