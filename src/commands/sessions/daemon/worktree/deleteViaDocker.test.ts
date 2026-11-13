import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { daemonLog } from "../daemonLog";
import { deleteTreeDirectly } from "./deleteTreeDirectly";
import { docker } from "./docker";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./git", () => ({ git: vi.fn(() => Promise.resolve("")) }));
vi.mock("node:fs/promises", () => ({
	rm: vi.fn(() =>
		Promise.reject(
			Object.assign(new Error("EACCES: permission denied, rmdir"), {
				code: "EACCES",
			}),
		),
	),
}));

const dockerMock = vi.mocked(docker);
const logs = () => vi.mocked(daemonLog).mock.calls.map(([line]) => line);

let root: string;
let tree: string;

describe("deleteTreeDirectly on a root-owned tree", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		root = mkdtempSync(join(tmpdir(), "docker-rm-"));
		tree = join(root, "repo-2");
		mkdirSync(join(tree, "docker-local"), { recursive: true });
	});

	it("deletes it through a throwaway Docker container, without sudo", async () => {
		dockerMock.mockImplementation(async (args) => {
			if (args[0] === "run") rmSync(tree, { recursive: true });
			return "";
		});

		const removal = await deleteTreeDirectly(join(root, "repo"), tree, "test");

		expect(removal).toEqual({ removed: true });
		expect(dockerMock).toHaveBeenCalledWith(
			["run", "--rm", "-v", `${root}:/p`, "alpine:3", "rm", "-rf", "/p/repo-2"],
			expect.any(Number),
		);
		expect(
			logs().some((l) => l.includes(`${tree} deleted through Docker`)),
		).toBe(true);
		expect(logs().some((l) => l.includes("sudo"))).toBe(false);
	});

	it("defers the removal when Docker is not reachable", async () => {
		dockerMock.mockRejectedValue(
			new Error("Cannot connect to the Docker daemon"),
		);

		const removal = await deleteTreeDirectly(join(root, "repo"), tree, "test");

		expect(removal).toMatchObject({ removed: false, deferred: true });
		expect(dockerMock).toHaveBeenCalledTimes(1);
		expect(logs().some((l) => l.includes(`${tree} delete deferred`))).toBe(
			true,
		);
	});

	it("reports a failed Docker removal without deferring it", async () => {
		dockerMock.mockImplementation(async (args) => {
			if (args[0] === "run") throw new Error("pull access denied");
			return "";
		});

		const removal = await deleteTreeDirectly(join(root, "repo"), tree, "test");

		expect(removal).toMatchObject({ removed: false });
		expect(removal).not.toHaveProperty("deferred");
		expect(logs().some((l) => l.includes("Docker delete failed"))).toBe(true);
	});
});
