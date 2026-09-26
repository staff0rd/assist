// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SessionTopBarStatus } from "./SessionTopBarStatus";
import type { SessionInfo } from "../../../../../../../types";

afterEach(cleanup);

const session: SessionInfo = {
	id: "1",
	name: "my session",
	commandType: "claude",
	status: "running",
	startedAt: 0,
};

function renderStatus(overrides: Partial<SessionInfo> = {}) {
	return render(<SessionTopBarStatus session={{ ...session, ...overrides }} />);
}

describe("SessionTopBarStatus", () => {
	it("rings the running dot while the session is verifying", () => {
		const { container } = renderStatus({ verifying: true });

		expect(screen.getByTitle("verifying")).toBeTruthy();
		expect(container.querySelector(".verify-ring")).toBeTruthy();
		expect(screen.getByText("running")).toBeTruthy();
	});

	it("reverts to the labelled dot once verify finishes", () => {
		const { container } = renderStatus({ verifying: false });

		expect(screen.getByText("● running")).toBeTruthy();
		expect(container.querySelector(".verify-ring")).toBeNull();
	});

	it("leaves the waiting label in place for a session awaiting a pr preview", () => {
		const { container } = renderStatus({
			verifying: true,
			pendingPrPreview: {
				requestId: "r1",
				title: "t",
				body: "b",
				prNumber: null,
			},
		});

		expect(screen.getByText("● waiting")).toBeTruthy();
		expect(container.querySelector(".verify-ring")).toBeNull();
	});

	it("keeps naming the restore state alongside the ring", () => {
		renderStatus({ verifying: true, restored: false });

		expect(screen.getByText("not restored")).toBeTruthy();
	});
});
