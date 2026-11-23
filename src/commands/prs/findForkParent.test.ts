import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecFileSync = vi.fn();

vi.mock("node:child_process", () => ({
	execFileSync: (...args: unknown[]) => mockExecFileSync(...args),
}));

import { findForkParent } from "./findForkParent";

const ORIGIN = { org: "Turtlator", repo: "assist" };
const PARENT = { org: "staff0rd", repo: "assist" };

function setup(responses: { cached?: string; gh?: string | Error }) {
	mockExecFileSync.mockImplementation((file: string, args: string[]) => {
		if (file === "git" && args.includes("--get")) {
			if (responses.cached === undefined) throw new Error("exit 1");
			return `${responses.cached}\n`;
		}
		if (file === "gh") {
			if (responses.gh instanceof Error) throw responses.gh;
			return responses.gh ?? "";
		}
		return "";
	});
}

function callsTo(file: string): string[][] {
	return mockExecFileSync.mock.calls
		.filter(([called]) => called === file)
		.map(([, args]) => args as string[]);
}

function cacheWrites(): string[][] {
	return callsTo("git").filter((args) => !args.includes("--get"));
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe("findForkParent", () => {
	describe("when origin is a fork", () => {
		it("should return the parent repo gh reports", () => {
			setup({
				gh: JSON.stringify({
					parent: { name: "assist", owner: { login: "staff0rd" } },
				}),
			});

			expect(findForkParent(ORIGIN)).toEqual(PARENT);
			expect(callsTo("gh")).toEqual([
				["repo", "view", "Turtlator/assist", "--json", "parent"],
			]);
		});

		it("should cache the parent in the clone's git config", () => {
			setup({
				gh: JSON.stringify({
					parent: { name: "assist", owner: { login: "staff0rd" } },
				}),
			});

			findForkParent(ORIGIN);

			expect(cacheWrites()).toEqual([
				[
					"config",
					"--local",
					"assist.forkParent",
					"Turtlator/assist staff0rd/assist",
				],
			]);
		});
	});

	describe("when origin is not a fork", () => {
		it("should report and cache that there is no parent", () => {
			setup({ gh: JSON.stringify({ parent: null }) });

			expect(findForkParent(ORIGIN)).toBe("not-a-fork");
			expect(cacheWrites()).toEqual([
				[
					"config",
					"--local",
					"assist.forkParent",
					"Turtlator/assist not-a-fork",
				],
			]);
		});
	});

	describe("when the gh lookup fails", () => {
		it("should report the failure without caching it", () => {
			setup({ gh: new Error("gh: not logged in") });

			expect(findForkParent(ORIGIN)).toBe("lookup-failed");
			expect(cacheWrites()).toEqual([]);
		});
	});

	describe("when the answer is already cached", () => {
		it("should return the cached parent without calling gh", () => {
			setup({ cached: "turtlator/Assist staff0rd/assist" });

			expect(findForkParent(ORIGIN)).toEqual(PARENT);
			expect(callsTo("gh")).toEqual([]);
		});

		it("should return a cached non-fork answer without calling gh", () => {
			setup({ cached: "Turtlator/assist not-a-fork" });

			expect(findForkParent(ORIGIN)).toBe("not-a-fork");
			expect(callsTo("gh")).toEqual([]);
		});

		it("should look up again when the cache is for a different origin", () => {
			setup({
				cached: "someone/else staff0rd/assist",
				gh: JSON.stringify({ parent: null }),
			});

			expect(findForkParent(ORIGIN)).toBe("not-a-fork");
			expect(callsTo("gh")).toHaveLength(1);
		});
	});
});
