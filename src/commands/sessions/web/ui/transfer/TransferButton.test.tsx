// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { NodesState, SessionInfo } from "../types";
import { TransferButton } from "./TransferButton";
import { TransferContext } from "./useTransferContext";

vi.mock("./useTransferTargets", () => ({
	useTransferTargets: () => [{ node: "mac", cwd: "/Users/me/git/assist" }],
}));

afterEach(cleanup);

const nodes: NodesState = {
	local: "work-wsl",
	links: [{ name: "mac", url: "ws://mac", state: "connected" }],
};

function renderButton(overrides: Partial<SessionInfo>) {
	const transfer = vi.fn();
	const session: SessionInfo = {
		id: "7",
		name: "fix the flaky test",
		commandType: "claude",
		claudeSessionId: "c-1",
		status: "waiting",
		startedAt: 0,
		repoGroup: { origin: "github.com/x/assist", clone: "/git/assist" },
		...overrides,
	};
	render(
		<TransferContext.Provider
			value={{ nodes, transfer, cancel: vi.fn(), dismissError: vi.fn() }}
		>
			<TransferButton session={session} />
		</TransferContext.Provider>,
	);
	return transfer;
}

describe("TransferButton", () => {
	it("lists each target with the cwd it will resume in", () => {
		const transfer = renderButton({ harness: "claude" });
		fireEvent.click(screen.getByRole("button", { name: "Transfer to node" }));
		const item = screen.getByRole("menuitem");
		expect(item.textContent).toBe("mac/Users/me/git/assist");
		fireEvent.click(item);
		expect(transfer).toHaveBeenCalledWith("7", "mac", "/Users/me/git/assist");
	});

	it("disables Transfer for a Pi session with the reason", () => {
		renderButton({ harness: "pi" });
		const button = screen.getByRole("button", {
			name: "Transfer unavailable: Pi can't resume a conversation on another node",
		});
		expect((button as HTMLButtonElement).disabled).toBe(true);
	});

	it("hides Transfer for a Pi session outside a repo", () => {
		renderButton({ harness: "pi", repoGroup: undefined });
		expect(screen.queryByRole("button")).toBeNull();
	});
});
