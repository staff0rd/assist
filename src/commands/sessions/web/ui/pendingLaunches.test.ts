import { describe, expect, it } from "vitest";
import {
	addLaunch,
	dismissLaunch,
	failLaunch,
	failOldestLaunching,
	type PendingLaunch,
	resolveOldestLaunching,
} from "./PendingLaunch";
import { pendingLaunchFromMessage } from "./useSessionSocket/useSend/pendingLaunchFromMessage";

const base = { startedAt: 0 };

function launching(id: string, cwd?: string): PendingLaunch {
	return { id, cwd, title: id, status: "launching", ...base };
}

describe("addLaunch", () => {
	it("keeps the target node so the card can name where it is starting", () => {
		const [launch] = addLaunch([], {
			id: "1",
			cwd: "C:\\Users\\me\\repo",
			title: "x",
			node: "pc-windows",
			...base,
		});
		expect(launch.node).toBe("pc-windows");
		expect(launch.status).toBe("launching");
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

describe("pendingLaunchFromMessage", () => {
	it("marks an assist launch with a caller-supplied title as named", () => {
		expect(
			pendingLaunchFromMessage({
				type: "create-assist",
				assistArgs: ["backlog", "run", "a775"],
				title: "a775 — Keep the backlog view put",
			}),
		).toEqual({
			cwd: undefined,
			title: "a775 — Keep the backlog view put",
			named: true,
		});
	});

	it("leaves an untitled assist launch unnamed so its placeholder never reaches a toast", () => {
		expect(pendingLaunchFromMessage({ type: "create-assist" })).toEqual({
			cwd: undefined,
			title: "New session",
			named: false,
		});
	});

	it("leaves a prompted session unnamed", () => {
		expect(
			pendingLaunchFromMessage({ type: "create", prompt: "fix the login bug" }),
		).toEqual({ cwd: undefined, title: "fix the login bug" });
	});
});
