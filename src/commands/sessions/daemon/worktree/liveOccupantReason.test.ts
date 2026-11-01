import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { describeOccupants } from "./describeOccupants";
import { readOccupant } from "./readOccupant";

const created: string[] = [];

afterEach(() => {
	for (const dir of created.splice(0))
		rmSync(dir, { recursive: true, force: true });
});

type FakeProcess = { comm: string; ppid: number; cmdline: string };

function fakeProc(processes: Record<number, FakeProcess>): string {
	const root = mkdtempSync(join(tmpdir(), "fake-proc-"));
	created.push(root);
	for (const [pid, p] of Object.entries(processes)) {
		const dir = join(root, pid);
		mkdirSync(dir);
		writeFileSync(join(dir, "comm"), `${p.comm}\n`);
		writeFileSync(join(dir, "stat"), `${pid} (${p.comm}) S ${p.ppid} 1 1 0`);
		writeFileSync(join(dir, "cmdline"), p.cmdline.replaceAll(" ", "\0"));
	}
	return root;
}

const server = "/home/u/.vscode-server/bin/f6cf/node";

describe("liveOccupantReason", () => {
	const proc = () =>
		fakeProc({
			100: { comm: "node", ppid: 1, cmdline: `${server} out/server-main.js` },
			200: {
				comm: "node",
				ppid: 100,
				cmdline: `${server} --type=extensionHost`,
			},
			300: {
				comm: "oxlint",
				ppid: 200,
				cmdline: "/repo/node_modules/.bin/oxlint --lsp",
			},
			400: { comm: "docker", ppid: 200, cmdline: "docker run mcp/playwright" },
			500: { comm: "bash", ppid: 1, cmdline: "bash" },
			501: { comm: "bash", ppid: 500, cmdline: "bash" },
			600: { comm: "sleep", ppid: 500, cmdline: "sleep 30" },
		});

	it("names VS Code for processes descended from the VS Code server", () => {
		const root = proc();
		const occupants = [300, 200, 400].map((pid) => readOccupant(pid, root));

		expect(describeOccupants(occupants)).toBe(
			"VS Code has this worktree open (pid 200, 300, 400)",
		);
	});

	it("groups unrecognised occupants by command name, keeping their pids", () => {
		const root = proc();
		const occupants = [501, 600, 500].map((pid) => readOccupant(pid, root));

		expect(describeOccupants(occupants)).toBe(
			"a live process is still running in it: bash (pid 500, 501), sleep (pid 600)",
		);
	});

	it("names VS Code and other programs together", () => {
		const root = proc();
		const occupants = [300, 600].map((pid) => readOccupant(pid, root));

		expect(describeOccupants(occupants)).toBe(
			"VS Code has this worktree open (pid 300); a live process is still running in it: sleep (pid 600)",
		);
	});

	it("falls back to the pid when the process has vanished", () => {
		expect(readOccupant(42, proc())).toEqual({
			pid: 42,
			name: "pid 42",
			vscode: false,
		});
	});

	it("reports nothing when no process occupies the tree", () => {
		expect(describeOccupants([])).toBeUndefined();
	});
});
