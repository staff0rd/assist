import { chmodSync, existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { discardTree } from "./discardTree";
import { forgetWorktree, markLeftover } from "./worktree/readWorktreeRegistry";
import { checkDurability } from "./worktree/treeDurability";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./worktree/readWorktreeRegistry", () => ({
	forgetWorktree: vi.fn(),
	markLeftover: vi.fn(),
	worktreeAttributionIncludingReaped: vi.fn(() => undefined),
}));

const created: string[] = [];

afterEach(() => {
	for (const base of created.splice(0)) {
		chmodSync(join(base, "docker-local"), 0o755);
		rmSync(base, { recursive: true, force: true });
	}
});

function leftoverWithUndeletableChild(): string {
	const base = mkdtempSync(join(tmpdir(), "discard-leftover-"));
	created.push(base);
	const lockedParent = join(base, "docker-local");
	mkdirSync(join(lockedParent, "azure"), { recursive: true });
	chmodSync(lockedParent, 0o555);
	return base;
}

const runsAsRoot = process.getuid?.() === 0;

describe.skipIf(runsAsRoot)(
	"discardTree on a leftover with no git checkout",
	() => {
		it("is not reported as holding work", async () => {
			const path = leftoverWithUndeletableChild();

			expect(await checkDurability(path)).toEqual({
				durable: true,
				gone: true,
			});
		});

		it("discards the card and leaves the directory to the restart recheck", async () => {
			const path = leftoverWithUndeletableChild();
			const session = makeSession({
				status: "stopped",
				closing: true,
				cwd: path,
				worktree: { path, clone: "/git/repo" },
				undurable: { reason: "tree state unreadable", removesTree: true },
			});
			const discarded = vi.fn();
			const notify = vi.fn();

			await discardTree(session, discarded, notify);

			expect(existsSync(path)).toBe(true);
			expect(discarded).toHaveBeenCalled();
			expect(session.worktree).toBeUndefined();
			expect(session.subtitle ?? "").not.toContain("rm -rf");
			expect(vi.mocked(forgetWorktree)).not.toHaveBeenCalled();
			expect(vi.mocked(markLeftover)).toHaveBeenCalledWith(
				path,
				expect.stringContaining("Docker is not reachable"),
			);
		});
	},
);
