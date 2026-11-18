import { describe, expect, it } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import { transferRefusal } from "./transferRefusal";

const links = {
	localNode: () => "work-wsl",
	isConnected: (node: string) => node === "mac",
};

describe("transferRefusal", () => {
	it("accepts a Claude prompt session in a working tree", () => {
		const s = makeSession({
			commandType: "claude",
			claudeSessionId: "c-1",
			cwd: "/git/assist-3",
		});
		expect(transferRefusal(s, "mac", links)).toBeUndefined();
	});

	it("refuses a prompt session with no working tree", () => {
		const s = makeSession({
			commandType: "claude",
			claudeSessionId: "c-1",
			cwd: undefined,
		});
		expect(transferRefusal(s, "mac", links)).toBe(
			"the session has no working tree to transfer",
		);
	});

	it("refuses sessions that are neither backlog runs nor Claude prompts", () => {
		const s = makeSession({ commandType: "run", cwd: "/git/assist" });
		expect(transferRefusal(s, "mac", links)).toBe(
			"only backlog run and resumable prompt sessions can be transferred",
		);
	});

	it("refuses a Pi prompt session with the harness reason", () => {
		const s = makeSession({
			commandType: "claude",
			harness: "pi",
			claudeSessionId: "c-1",
			cwd: "/git/assist-3",
		});
		expect(transferRefusal(s, "mac", links)).toBe(
			"Pi can't resume a conversation on another node",
		);
	});
});
