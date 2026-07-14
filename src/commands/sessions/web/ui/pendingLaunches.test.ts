import { describe, expect, it } from "vitest";
import {
	addLaunch,
	dismissLaunch,
	failLaunch,
	failOldestLaunching,
	type PendingLaunch,
	resolveOldestLaunching,
} from "./PendingLaunch";

const base = { startedAt: 0 };

function launching(id: string, cwd?: string): PendingLaunch {
	return { id, cwd, title: id, windows: false, status: "launching", ...base };
}

describe("addLaunch", () => {
	it("flags a Windows cwd so the card can explain the cold-start delay", () => {
		const [win] = addLaunch([], {
			id: "1",
			cwd: "C:\\Users\\me\\repo",
			title: "x",
			...base,
		});
		expect(win.windows).toBe(true);
		expect(win.status).toBe("launching");
	});

	it("treats a POSIX cwd as non-Windows", () => {
		const [posix] = addLaunch([], {
			id: "2",
			cwd: "/home/me/repo",
			title: "x",
			...base,
		});
		expect(posix.windows).toBe(false);
	});
});

describe("resolveOldestLaunching", () => {
	it("removes the oldest launching entry so a created ack clears one launch", () => {
		const list = [launching("a"), launching("b")];
		expect(resolveOldestLaunching(list).map((l) => l.id)).toEqual(["b"]);
	});

	it("skips entries already in error and clears the oldest still launching", () => {
		const list = [failLaunch([launching("a")], "a", "boom")[0], launching("b")];
		expect(resolveOldestLaunching(list).map((l) => l.id)).toEqual(["a"]);
	});

	it("is a no-op when nothing is launching", () => {
		const list = [failLaunch([launching("a")], "a", "boom")[0]];
		expect(resolveOldestLaunching(list)).toEqual(list);
	});
});

describe("failOldestLaunching", () => {
	it("marks the oldest launching entry as errored with the message", () => {
		const list = [launching("a"), launching("b")];
		const failed = failOldestLaunching(list, "did not start");
		expect(failed[0]).toMatchObject({
			status: "error",
			error: "did not start",
		});
		expect(failed[1].status).toBe("launching");
	});

	it("leaves the list untouched when no launch is pending", () => {
		expect(failOldestLaunching([], "x")).toEqual([]);
	});
});

describe("dismissLaunch", () => {
	it("removes the entry with the given id", () => {
		const list = [launching("a"), launching("b")];
		expect(dismissLaunch(list, "a").map((l) => l.id)).toEqual(["b"]);
	});
});
