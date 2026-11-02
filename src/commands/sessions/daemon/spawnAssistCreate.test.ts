import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionManager } from "./SessionManager";

const mockHolder = vi.fn(
	async (
		_args: string[],
		_cwd: string | undefined,
	): Promise<string | undefined> => undefined,
);

vi.mock("./worktree/prCheckoutHolder", () => ({
	prCheckoutHolder: (args: string[], cwd: string | undefined) =>
		mockHolder(args, cwd),
}));

import { spawnAssistCreate } from "./spawnAssistCreate";

function manager() {
	const spawnAssist = vi.fn(() => "9");
	return { m: { spawnAssist } as unknown as SessionManager, spawnAssist };
}

describe("spawnAssistCreate", () => {
	beforeEach(() => {
		mockHolder.mockReset();
		mockHolder.mockResolvedValue(undefined);
	});

	it("launches a PR checkout in place in the worktree already holding its branch", async () => {
		mockHolder.mockResolvedValue("/git/app-5");
		const { m, spawnAssist } = manager();

		const id = await spawnAssistCreate(m, {
			assistArgs: ["review", "--high-level", "2087"],
			cwd: "/git/app",
		});

		expect(id).toBe("9");
		expect(spawnAssist).toHaveBeenCalledWith(
			["review", "--high-level", "2087"],
			"/git/app-5",
			{ title: undefined, subtitle: undefined, inPlace: true },
			{ launchedFrom: undefined },
		);
	});

	it("allocates as usual when no worktree holds the branch", async () => {
		const { m, spawnAssist } = manager();

		await spawnAssistCreate(m, {
			assistArgs: ["review", "2087"],
			cwd: "/git/app",
		});

		expect(spawnAssist).toHaveBeenCalledWith(
			["review", "2087"],
			"/git/app",
			{ title: undefined, subtitle: undefined, inPlace: false },
			{ launchedFrom: undefined },
		);
	});

	it("carries autoApprove into the session meta", async () => {
		const { m, spawnAssist } = manager();

		await spawnAssistCreate(m, {
			assistArgs: ["draft", "--once"],
			cwd: "/git/app",
			autoApprove: true,
		});

		expect(spawnAssist).toHaveBeenCalledWith(
			["draft", "--once"],
			"/git/app",
			{
				title: undefined,
				subtitle: undefined,
				autoApprove: true,
				inPlace: false,
			},
			{ launchedFrom: undefined },
		);
	});

	it("skips the lookup for an in-place launch", async () => {
		const { m } = manager();

		await spawnAssistCreate(m, {
			assistArgs: ["review", "2087"],
			cwd: "/git/app",
			inPlace: true,
		});

		expect(mockHolder).not.toHaveBeenCalled();
	});
});
