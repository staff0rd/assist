import { execSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

import { readSessionPrRef } from "./readSessionPrRef";

const mockExecSync = vi.mocked(execSync);

function stubGit(responses: Record<string, string | Error>) {
	mockExecSync.mockImplementation((cmd: string) => {
		for (const [fragment, value] of Object.entries(responses)) {
			if (cmd.includes(fragment)) {
				if (value instanceof Error) throw value;
				return value;
			}
		}
		throw new Error(`unexpected command: ${cmd}`);
	});
}

describe("readSessionPrRef", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("reads the current branch PR into a git ref", () => {
		stubGit({
			"rev-parse --abbrev-ref HEAD": "feature",
			"gh pr view": JSON.stringify({
				number: 42,
				title: "Add login",
				url: "https://github.com/acme/widgets/pull/42",
				state: "OPEN",
			}),
		});

		expect(readSessionPrRef()).toEqual({
			kind: "pr",
			ref: "42",
			title: "Add login",
			url: "https://github.com/acme/widgets/pull/42",
			state: "OPEN",
		});
	});

	it("returns null on a detached HEAD", () => {
		stubGit({ "rev-parse --abbrev-ref HEAD": "HEAD" });
		expect(readSessionPrRef()).toBeNull();
	});

	it("returns null when gh finds no PR", () => {
		stubGit({
			"rev-parse --abbrev-ref HEAD": "feature",
			"gh pr view": new Error("no pull requests found"),
		});
		expect(readSessionPrRef()).toBeNull();
	});
});
