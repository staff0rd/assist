// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../../../../../../../../test/mothers/makeSessionInfo";
import { GroupStatusTally } from "./GroupStatusTally";

afterEach(cleanup);

const checkPreview = {
	requestId: "req-1",
	title: "Check",
	body: "body",
	prNumber: null,
	kind: "check" as const,
};

describe("GroupStatusTally", () => {
	it("tallies manual checks under a wrench head", () => {
		const { container } = render(
			<GroupStatusTally
				sessions={[
					makeSessionInfo({
						status: "waiting",
						pendingPrPreview: checkPreview,
					}),
					makeSessionInfo({ status: "done" }),
				]}
			/>,
		);

		const check = container.querySelector("[data-tally='check']");
		expect(check?.querySelector("[data-testid='wrench-head']")).not.toBeNull();
		expect(check?.textContent).toBe(" 1 check");
		expect(container.querySelector("[data-tally='done']")?.textContent).toBe(
			"✓ 1 done",
		);
	});
});
