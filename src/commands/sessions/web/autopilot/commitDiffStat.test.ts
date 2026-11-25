import { execFile } from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../../../test/mocks/childProcessMock";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

import { commitDiffStat } from "./commitDiffStat";

const mockExecFile = vi.mocked(execFile);

type Callback = (
	err: Error | null,
	result?: { stdout: string; stderr: string },
) => void;

function replyWith(numstat: Record<string, string | Error>) {
	mockExecFile.mockImplementation(((
		_file: string,
		args: string[],
		_options: unknown,
		callback: Callback,
	) => {
		const out = numstat[args[args.length - 1]];
		setImmediate(() =>
			out instanceof Error
				? callback(out)
				: callback(null, { stdout: out ?? "", stderr: "" }),
		);
	}) as unknown as typeof execFile);
}

afterEach(() => {
	mockExecFile.mockReset();
});

describe("commitDiffStat", () => {
	it("sums insertions and deletions across commits and files", async () => {
		replyWith({
			aaa1: "3\t1\tsrc/a.ts\n2\t0\tsrc/b.ts\n",
			bbb1: "10\t4\tsrc/c.ts\n-\t-\timage.png\n",
		});
		expect(await commitDiffStat("/repo-sum", ["aaa1", "bbb1"])).toEqual({
			insertions: 15,
			deletions: 5,
		});
	});

	it("runs git asynchronously for each SHA concurrently", async () => {
		replyWith({ aaa2: "1\t1\tx\n", bbb2: "2\t2\ty\n" });
		const pending = commitDiffStat("/repo-async", ["aaa2", "bbb2"]);
		expect(mockExecFile).toHaveBeenCalledTimes(2);
		expect(await pending).toEqual({ insertions: 3, deletions: 3 });
	});

	it("skips git for SHAs it has already measured", async () => {
		replyWith({ aaa3: "5\t2\tx\n" });
		await commitDiffStat("/repo-cache", ["aaa3"]);
		mockExecFile.mockClear();
		expect(await commitDiffStat("/repo-cache", ["aaa3"])).toEqual({
			insertions: 5,
			deletions: 2,
		});
		expect(mockExecFile).not.toHaveBeenCalled();
	});

	it("keys the cache by cwd as well as SHA", async () => {
		replyWith({ aaa4: "1\t0\tx\n" });
		await commitDiffStat("/repo-one", ["aaa4"]);
		await commitDiffStat("/repo-two", ["aaa4"]);
		expect(mockExecFile).toHaveBeenCalledTimes(2);
	});

	it("does not cache a failed lookup", async () => {
		replyWith({ aaa5: new Error("unknown revision") });
		expect(await commitDiffStat("/repo-fail", ["aaa5"])).toEqual({
			insertions: 0,
			deletions: 0,
		});
		replyWith({ aaa5: "4\t1\tx\n" });
		expect(await commitDiffStat("/repo-fail", ["aaa5"])).toEqual({
			insertions: 4,
			deletions: 1,
		});
	});
});
