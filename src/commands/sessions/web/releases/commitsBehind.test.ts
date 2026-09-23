import { beforeEach, describe, expect, it, vi } from "vitest";
import { commitsBehind } from "./commitsBehind";
import { ghJson } from "./ghJson";

vi.mock("./ghJson", () => ({ ghJson: vi.fn() }));

const ghJsonMock = vi.mocked(ghJson);

beforeEach(() => {
	ghJsonMock.mockReset();
});

describe("commitsBehind", () => {
	it("reads every commit's distance in one query", async () => {
		ghJsonMock.mockResolvedValue({
			data: {
				repository: { ref: { c0: { behindBy: 0 }, c1: { behindBy: 18 } } },
			},
		} as never);

		const behind = await commitsBehind("/repo", "owner/name", "main", [
			"aaa111",
			"bbb222",
		]);

		expect(ghJsonMock).toHaveBeenCalledTimes(1);
		const args = ghJsonMock.mock.calls[0]?.[1] ?? [];
		expect(args).toContain("base=refs/heads/main");
		expect(args.find((arg) => arg.startsWith("query="))).toContain(
			'c1: compare(headRef:"bbb222")',
		);
		expect(behind).toEqual(
			new Map([
				["aaa111", 0],
				["bbb222", 18],
			]),
		);
	});

	it("leaves a commit GitHub cannot compare unknown", async () => {
		ghJsonMock.mockResolvedValue({
			data: { repository: { ref: { c0: { behindBy: 4 }, c1: null } } },
		} as never);

		const behind = await commitsBehind("/repo", "owner/name", "main", [
			"aaa111",
			"gone999",
		]);

		expect(behind.get("aaa111")).toBe(4);
		expect(behind.get("gone999")).toBeNull();
	});

	it("makes no call when nothing is live", async () => {
		const behind = await commitsBehind("/repo", "owner/name", "main", []);

		expect(ghJsonMock).not.toHaveBeenCalled();
		expect(behind.size).toBe(0);
	});
});
