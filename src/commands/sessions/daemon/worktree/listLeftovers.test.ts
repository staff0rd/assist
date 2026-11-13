import { mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listLeftovers } from "./listLeftovers";
import {
	clearLeftover,
	readReapedWorktreeRegistry,
} from "./readWorktreeRegistry";

vi.mock("./readWorktreeRegistry", () => ({
	readReapedWorktreeRegistry: vi.fn(),
	clearLeftover: vi.fn(),
}));

const registryMock = vi.mocked(readReapedWorktreeRegistry);

let root: string;

function record(name: string, leftover?: string) {
	return {
		path: join(root, name),
		clone: join(root, "repo"),
		origin: "o",
		leftover,
	};
}

describe("listLeftovers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		root = mkdtempSync(join(tmpdir(), "leftovers-"));
	});

	it("lists every recorded leftover still on disk, however many", () => {
		const records = Array.from({ length: 17 }, (_, i) =>
			record(`repo-${i + 2}`, `EACCES ${i}`),
		);
		for (const r of records)
			mkdirSync(join(r.path, "docker-local"), { recursive: true });
		registryMock.mockReturnValue(records);

		expect(listLeftovers()).toHaveLength(17);
	});

	it("skips reaped records with no leftover recorded", () => {
		mkdirSync(join(root, "repo-2"));
		registryMock.mockReturnValue([record("repo-2")]);

		expect(listLeftovers()).toEqual([]);
	});

	it("clears a recorded leftover once its path is gone", () => {
		registryMock.mockReturnValue([record("repo-2", "EACCES")]);

		expect(listLeftovers()).toEqual([]);
		expect(vi.mocked(clearLeftover)).toHaveBeenCalledWith(join(root, "repo-2"));
	});
});
