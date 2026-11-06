import {
	mkdirSync,
	mkdtempSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { liveProcessesInTree } from "./liveProcessesInTree";

const created: string[] = [];

afterEach(() => {
	for (const dir of created.splice(0))
		rmSync(dir, { recursive: true, force: true });
});

function fakeProc(cwds: Record<string, string>): string {
	const root = mkdtempSync(join(tmpdir(), "fake-proc-"));
	created.push(root);
	for (const [pid, cwd] of Object.entries(cwds)) {
		mkdirSync(join(root, pid));
		symlinkSync(cwd, join(root, pid, "cwd"));
	}
	mkdirSync(join(root, "self"));
	return root;
}

describe("liveProcessesInTree", () => {
	it("lists processes whose cwd is the tree or inside it", () => {
		const proc = fakeProc({
			"10": "/git/assist-5",
			"11": "/git/assist-5/src",
			"12": "/git/assist-50",
			"13": "/git/assist-3",
		});
		expect(liveProcessesInTree("/git/assist-5", proc).sort()).toEqual([10, 11]);
	});

	it("ignores Codex's shared managed app-server but not other occupants", () => {
		const proc = fakeProc({
			"20": "/git/assist-5",
			"21": "/git/assist-5",
			"22": "/git/assist-5",
			"23": "/git/assist-5",
			"24": "/git/assist-5",
		});
		const bin = "/home/u/.codex/packages/app-server-daemon/releases/x/bin";
		const cmdlines: Record<string, string[]> = {
			"20": [
				`${bin}/codex`,
				"app-server",
				"--listen",
				"unix://",
				"--managed-daemon",
			],
			"21": [`${bin}/codex`, "app-server", "daemon", "pid-update-loop"],
			"22": [`${bin}/codex-code-mode-host`],
			"23": ["/usr/bin/node", "vite"],
			"24": ["codex", "app-server", "--listen", "stdio://"],
		};
		for (const [pid, args] of Object.entries(cmdlines))
			writeFileSync(join(proc, pid, "cmdline"), `${args.join("\0")}\0`);
		expect(liveProcessesInTree("/git/assist-5", proc).sort()).toEqual([23, 24]);
	});

	it("finds nothing when the proc root is unreadable", () => {
		expect(liveProcessesInTree("/git/assist-5", "/no/such/proc")).toEqual([]);
	});
});
