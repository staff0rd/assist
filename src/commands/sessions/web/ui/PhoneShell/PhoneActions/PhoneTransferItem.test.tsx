// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneTransferItem } from "./PhoneTransferItem";

afterEach(cleanup);

const socket = {
	nodes: {
		local: "work-wsl",
		links: [{ name: "mac", url: "ws://mac", state: "connected" }],
	},
} as unknown as SessionSocket;

const session: SessionInfo = {
	id: "7",
	name: "fix the flaky test",
	commandType: "claude",
	harness: "pi",
	claudeSessionId: "c-1",
	status: "waiting",
	startedAt: 0,
	repoGroup: { origin: "github.com/x/assist", clone: "/git/assist" },
};

describe("PhoneTransferItem", () => {
	it("shows a disabled Transfer item with the reason for a Pi session", () => {
		render(
			<PhoneTransferItem session={session} socket={socket} onDone={() => {}} />,
		);
		const item = screen.getByRole("button", { name: /Transfer to node/ });
		expect(item.getAttribute("aria-disabled")).toBe("true");
		expect(
			screen.getByText("Pi can't resume a conversation on another node"),
		).toBeTruthy();
	});
});
