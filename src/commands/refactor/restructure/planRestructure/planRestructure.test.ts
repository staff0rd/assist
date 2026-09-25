import { describe, expect, it } from "vitest";
import { planRestructure } from "./index";
import type { PlannerEdge, PlannerInput } from "./types";

const ROOT = "/r";

function input(
	edges: [string, string][],
	extraFiles: string[] = [],
): PlannerInput {
	const plannerEdges = edges.map(([source, target]) => ({ source, target }));
	const files = new Set(extraFiles);
	for (const { source, target } of plannerEdges)
		for (const f of [source, target])
			if (f.startsWith(`${ROOT}/`)) files.add(f);
	return { scopeRoot: ROOT, files: [...files], edges: plannerEdges };
}

function targetOf(
	plan: ReturnType<typeof planRestructure>,
	file: string,
): string {
	return plan.targets.get(file) as string;
}

function seededRandom(seed: number): () => number {
	let state = seed;
	return () => {
		state = (state * 1103515245 + 12345) % 2147483648;
		return state / 2147483648;
	};
}

function shuffle<T>(items: T[], random: () => number): T[] {
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

function randomInput(seed: number): PlannerInput {
	const random = seededRandom(seed);
	const dirs = ["", "x/", "x/y/", "z/"];
	const files = Array.from({ length: 40 }, (_, i) => {
		const dir = dirs[Math.floor(random() * dirs.length)];
		return `${ROOT}/${dir}m${i}${i % 7 === 0 ? ".test" : ""}.ts`;
	});
	const edges: PlannerEdge[] = [];
	for (let i = 0; i < 80; i++) {
		const source = files[Math.floor(random() * files.length)];
		const target = files[Math.floor(random() * files.length)];
		edges.push({ source, target });
	}
	edges.push({ source: "/outside/o.ts", target: files[3] });
	return { scopeRoot: ROOT, files, edges };
}

function applyMoves(
	plannerInput: PlannerInput,
	plan: ReturnType<typeof planRestructure>,
): PlannerInput {
	const moved = (f: string) => plan.targets.get(f) ?? f;
	return {
		scopeRoot: plannerInput.scopeRoot,
		files: plannerInput.files.map(moved),
		edges: plannerInput.edges.map((e) => ({
			source: moved(e.source),
			target: moved(e.target),
		})),
	};
}

describe("planRestructure", () => {
	describe("when a file has a single importer", () => {
		it("should nest it in a folder named after the importer", () => {
			const plan = planRestructure(
				input([
					["/r/a.ts", "/r/b.ts"],
					["/r/b.ts", "/r/c.ts"],
				]),
			);

			expect(targetOf(plan, "/r/a.ts")).toBe("/r/a.ts");
			expect(targetOf(plan, "/r/b.ts")).toBe("/r/a/b.ts");
			expect(targetOf(plan, "/r/c.ts")).toBe("/r/a/b/c.ts");
		});
	});

	describe("when a file has several importers", () => {
		it("should place it directly in their lowest common folder", () => {
			const plan = planRestructure(
				input([
					["/r/a.ts", "/r/b.ts"],
					["/r/a.ts", "/r/c.ts"],
					["/r/b.ts", "/r/d.ts"],
					["/r/c.ts", "/r/d.ts"],
				]),
			);

			expect(targetOf(plan, "/r/d.ts")).toBe("/r/a/d.ts");
		});

		it("should place a file shared by two roots at the scope root", () => {
			const plan = planRestructure(
				input([
					["/r/x.ts", "/r/deep/s.ts"],
					["/r/y.ts", "/r/deep/s.ts"],
				]),
			);

			expect(targetOf(plan, "/r/deep/s.ts")).toBe("/r/s.ts");
		});

		it("should keep a file shared within one importer's subtree inside it", () => {
			const plan = planRestructure(
				input([
					["/r/a.ts", "/r/b.ts"],
					["/r/a.ts", "/r/s.ts"],
					["/r/b.ts", "/r/s.ts"],
				]),
			);

			expect(targetOf(plan, "/r/s.ts")).toBe("/r/a/s.ts");
		});
	});

	describe("when files import each other in a cycle", () => {
		it("should place the cycle members together as siblings", () => {
			const plan = planRestructure(
				input([
					["/r/a.ts", "/r/b.ts"],
					["/r/b.ts", "/r/c.ts"],
					["/r/c.ts", "/r/b.ts"],
				]),
			);

			expect(targetOf(plan, "/r/b.ts")).toBe("/r/a/b.ts");
			expect(targetOf(plan, "/r/c.ts")).toBe("/r/a/c.ts");
		});
	});

	describe("when a file is imported from outside the scope", () => {
		it("should keep it at the scope root", () => {
			const plan = planRestructure(
				input([
					["/outside/o.ts", "/r/nested/b.ts"],
					["/r/a.ts", "/r/nested/b.ts"],
				]),
			);

			expect(targetOf(plan, "/r/nested/b.ts")).toBe("/r/b.ts");
		});
	});

	describe("when a test file imports its subject", () => {
		it("should place the test and its test-only helpers next to the subject", () => {
			const plan = planRestructure(
				input([
					["/r/a.ts", "/r/b.ts"],
					["/r/b.test.ts", "/r/b.ts"],
					["/r/b.test.ts", "/r/fixture.ts"],
				]),
			);

			expect(targetOf(plan, "/r/b.test.ts")).toBe("/r/a/b.test.ts");
			expect(targetOf(plan, "/r/fixture.ts")).toBe("/r/a/fixture.ts");
		});

		it("should not count the test as an importer", () => {
			const plan = planRestructure(
				input([
					["/r/a.ts", "/r/b.ts"],
					["/r/other.test.ts", "/r/b.ts"],
					["/r/other.test.ts", "/r/other.ts"],
				]),
			);

			expect(targetOf(plan, "/r/b.ts")).toBe("/r/a/b.ts");
			expect(targetOf(plan, "/r/other.test.ts")).toBe("/r/other.test.ts");
		});
	});

	describe("when two files would share a basename in one folder", () => {
		it("should report a collision error", () => {
			const plan = planRestructure(
				input([], ["/r/x/types.ts", "/r/y/types.ts"]),
			);

			expect(plan.errors).toEqual([
				"Basename collision in ./: x/types.ts, y/types.ts",
			]);
		});
	});

	describe("when the input order is shuffled", () => {
		it("should produce an identical plan", () => {
			for (const seed of [1, 2, 3]) {
				const original = randomInput(seed);
				const random = seededRandom(seed + 100);
				const shuffled: PlannerInput = {
					...original,
					files: shuffle(original.files, random),
					edges: shuffle(original.edges, random),
				};

				const a = planRestructure(original);
				const b = planRestructure(shuffled);

				expect([...b.targets]).toEqual([...a.targets]);
				expect(b.moves).toEqual(a.moves);
				expect(b.errors).toEqual(a.errors);
			}
		});
	});

	describe("when re-planning after applying the moves", () => {
		it("should yield zero moves", () => {
			for (const seed of [1, 2, 3, 4, 5]) {
				const original = randomInput(seed);
				const first = planRestructure(original);
				expect(first.moves.length).toBeGreaterThan(0);

				const second = planRestructure(applyMoves(original, first));

				expect(second.moves).toEqual([]);
			}
		});
	});
});
