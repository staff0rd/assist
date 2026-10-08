import { beforeEach, describe, expect, it, vi } from "vitest";
import { daemonLog } from "../daemonLog";
import { reusesClone } from "./reusesClone";
import { checkDurabilitySync } from "./treeDurability";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./treeDurability", () => ({
	checkDurabilitySync: vi.fn(() => ({ durable: true })),
}));

const logMock = vi.mocked(daemonLog);
const durabilityMock = vi.mocked(checkDurabilitySync);

function logged(): string {
	return logMock.mock.calls.map(([line]) => line).join("\n");
}

describe("reusesClone", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		durabilityMock.mockReturnValue({ durable: true });
	});

	it("keeps the clone and records why it was free", () => {
		expect(reusesClone("/git/repo", new Set(), {})).toBe(true);
		expect(logged()).toContain("session kept in the clone /git/repo");
		expect(logged()).toContain("no live session holds it");
	});

	it("names the trees that were bound when it kept the clone", () => {
		reusesClone("/git/repo", new Set(["/git/other"]), {});

		expect(logged()).toContain("/git/other");
	});

	it("records the clone and the reason when a live session holds it", () => {
		expect(reusesClone("/git/repo", new Set(["/git/repo"]), {})).toBe(false);
		expect(logged()).toContain(
			"clone /git/repo is held by a live session — spilling to a worktree",
		);
	});

	it("records why a PR checkout refuses the clone", () => {
		durabilityMock.mockReturnValue({
			durable: false,
			reason: "uncommitted changes",
		});

		expect(reusesClone("/git/repo", new Set(), { forCheckout: true })).toBe(
			false,
		);
		expect(logged()).toContain("uncommitted changes");
	});
});
