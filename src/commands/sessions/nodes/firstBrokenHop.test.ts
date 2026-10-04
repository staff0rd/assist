import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LinkDiagnosis } from "./DoctorProbes";

const mockFindLinkSpec = vi.fn();
const mockDiagnoseLink = vi.fn<() => Promise<LinkDiagnosis>>();

vi.mock("../shared/loadLinkSpecs", () => ({
	findLinkSpec: (name: string) => mockFindLinkSpec(name),
}));
vi.mock("./queryNodes", () => ({ queryNodes: async () => undefined }));
vi.mock("./diagnoseLink", () => ({
	diagnoseLink: () => mockDiagnoseLink(),
}));

import { firstBrokenHop } from "./firstBrokenHop";

const SPEC = { name: "win", url: "http://win:3100" };

beforeEach(() => {
	mockFindLinkSpec.mockReset();
	mockDiagnoseLink.mockReset();
});

describe("firstBrokenHop", () => {
	it("returns the first failing hop of the link's diagnosis", async () => {
		mockFindLinkSpec.mockReturnValue(SPEC);
		mockDiagnoseLink.mockResolvedValue({
			...SPEC,
			ok: false,
			hops: [
				{ hop: "web", ok: true, detail: "win 0.759.1" },
				{ hop: "daemon", ok: false, error: "down", remediation: "start it" },
			],
		});

		expect(await firstBrokenHop("win")).toEqual({
			hop: "daemon",
			ok: false,
			error: "down",
			remediation: "start it",
		});
	});

	it("returns nothing when every hop passes", async () => {
		mockFindLinkSpec.mockReturnValue(SPEC);
		mockDiagnoseLink.mockResolvedValue({
			...SPEC,
			ok: true,
			hops: [{ hop: "web", ok: true, detail: "win 0.759.1" }],
		});

		expect(await firstBrokenHop("win")).toBeUndefined();
	});

	it("reports an unknown link without diagnosing", async () => {
		mockFindLinkSpec.mockReturnValue(undefined);

		expect((await firstBrokenHop("nope"))?.error).toBe("no link named nope");
		expect(mockDiagnoseLink).not.toHaveBeenCalled();
	});
});
