// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../../../test/mothers/makeSessionInfo";
import { SdkTail } from "./SdkTail";

afterEach(cleanup);

describe("SdkTail", () => {
	it("shows the restart divider and resuming row while the conversation resumes", () => {
		render(
			<SdkTail
				session={makeSessionInfo({
					sdk: true,
					status: "running",
					sdkResuming: true,
					sdkActivity: "Working · Bash ls",
				})}
			/>,
		);
		expect(screen.getByRole("separator").textContent).toContain(
			"Daemon restarted",
		);
		expect(screen.getByRole("status").textContent).toContain(
			"Resuming conversation…",
		);
	});

	it("shows the current activity once resumed", () => {
		render(
			<SdkTail
				session={makeSessionInfo({
					sdk: true,
					status: "running",
					sdkActivity: "Working · Bash ls",
				})}
			/>,
		);
		expect(screen.queryByRole("separator")).toBeNull();
		expect(screen.getByRole("status").textContent).toContain(
			"Working · Bash ls",
		);
	});
});
