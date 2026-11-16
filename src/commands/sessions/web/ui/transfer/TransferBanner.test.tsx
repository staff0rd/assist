// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionInfo } from "../types";
import { TransferBanner } from "./TransferBanner";
import { TransferContext } from "./useTransferContext";

vi.mock("./useTransferTargets", () => ({
	useTransferTargets: () => [{ node: "mac", cwd: "/Users/me/assist" }],
}));

afterEach(cleanup);

function renderBanner(transfer: SessionInfo["transfer"]) {
	const actions = {
		nodes: null,
		transfer: vi.fn(),
		cancel: vi.fn(),
		dismissError: vi.fn(),
	};
	const session: SessionInfo = {
		id: "7",
		name: "assist backlog run a1402",
		commandType: "assist",
		status: "running",
		startedAt: 0,
		transfer,
	};
	const view = render(
		<TransferContext.Provider value={actions}>
			<TransferBanner session={session} />
		</TransferContext.Provider>,
	);
	return { ...actions, view };
}

describe("TransferBanner", () => {
	it("renders nothing without a transfer or while one is in flight", () => {
		expect(renderBanner(undefined).view.container.innerHTML).toBe("");
		cleanup();
		expect(renderBanner({ target: "mac" }).view.container.innerHTML).toBe("");
	});

	it("names the queued target and cancels the transfer", () => {
		const { cancel } = renderBanner({ target: "mac", queued: {} });
		expect(screen.getByTestId("transfer-banner-warning").textContent).toContain(
			"Transfer to mac queued",
		);
		fireEvent.click(screen.getByRole("button", { name: "Cancel transfer" }));
		expect(cancel).toHaveBeenCalledWith("7");
	});

	it("shows the failure, retries to the target and dismisses the error", () => {
		const { transfer, dismissError } = renderBanner({
			target: "mac",
			error: "remote rejected",
		});
		expect(screen.getByTestId("transfer-banner-error").textContent).toContain(
			"Transfer to mac failed: remote rejected",
		);
		fireEvent.click(screen.getByRole("button", { name: "Retry" }));
		expect(transfer).toHaveBeenCalledWith("7", "mac", "/Users/me/assist");
		fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
		expect(dismissError).toHaveBeenCalledWith("7");
	});
});
