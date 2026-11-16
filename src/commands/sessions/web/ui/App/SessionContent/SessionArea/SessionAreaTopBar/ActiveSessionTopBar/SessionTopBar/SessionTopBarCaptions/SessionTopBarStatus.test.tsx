// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SessionTopBarStatus } from "./SessionTopBarStatus";
import type { SessionInfo } from "../../../../../../../types";
import { makeSessionInfo } from "../../../../../../../../../../../test/mothers/makeSessionInfo";

afterEach(cleanup);

function renderStatus(overrides: Partial<SessionInfo> = {}) {
	return render(
		<SessionTopBarStatus
			session={makeSessionInfo({ status: "running", ...overrides })}
		/>,
	);
}

describe("SessionTopBarStatus", () => {
	it("labels the pill verifying while the session is verifying", () => {
		renderStatus({ verifying: true });

		expect(screen.getByText("● verifying")).toBeTruthy();
	});

	it("reverts to the running pill once verify finishes", () => {
		renderStatus({ verifying: false });

		expect(screen.getByText("● running")).toBeTruthy();
	});

	it("leaves the waiting label in place for a session awaiting a pr preview", () => {
		renderStatus({
			verifying: true,
			pendingPrPreview: {
				requestId: "r1",
				title: "t",
				body: "b",
				prNumber: null,
			},
		});

		expect(screen.getByText("◆ waiting")).toBeTruthy();
	});

	it("keeps naming the restore state while verifying", () => {
		renderStatus({ verifying: true, restored: false });

		expect(screen.getByText("not restored")).toBeTruthy();
	});
	it("labels a driven session's SDK badge with its harness", () => {
		renderStatus({ sdk: true, harness: "codex-sdk" });

		expect(screen.getByText("Codex (SDK)")).toBeTruthy();
	});
});
