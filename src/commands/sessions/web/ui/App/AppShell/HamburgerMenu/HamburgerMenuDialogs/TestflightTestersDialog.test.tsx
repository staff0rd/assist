// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TestflightTesters } from "../../../../../../../testflight/TestflightTesters";
import { TestflightTestersDialog } from "./TestflightTestersDialog";

const testers: TestflightTesters = {
	bundleId: "com.example.app",
	internal: [
		{ email: "alex@x.com", team: "pending", testflight: "not-in-group" },
		{ email: "jo@x.com", team: "joined", testflight: "accepted" },
		{ email: "sam@x.com", team: "joined", testflight: "installed" },
	],
	external: [
		{ email: "morgan@y.com", testflight: "invited" },
		{ email: "pat@y.com", testflight: "not-invited" },
		{ email: "lee@y.com", testflight: "revoked" },
	],
};

let fetchMock: ReturnType<typeof vi.fn>;

function respond(status: number, body: unknown) {
	fetchMock.mockResolvedValueOnce(Response.json(body, { status }));
}

function rowText(section: string, email: string) {
	const region = screen.getByRole("region", { name: section });
	return within(region)
		.getAllByTestId("tester-row")
		.find((row) => row.textContent?.includes(email))?.textContent;
}

beforeEach(() => {
	fetchMock = vi.fn();
	vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe("TestflightTestersDialog", () => {
	it("renders each team and TestFlight state in its section", async () => {
		respond(200, testers);
		render(<TestflightTestersDialog onClose={() => {}} />);
		expect(await screen.findByText("com.example.app")).toBeTruthy();
		expect(rowText("Internal", "alex@x.com")).toContain(
			"Team · PendingNot in group",
		);
		expect(rowText("Internal", "jo@x.com")).toContain("Team · JoinedAccepted");
		expect(rowText("Internal", "sam@x.com")).toContain(
			"Team · JoinedInstalled",
		);
		expect(rowText("External", "morgan@y.com")).toBe("morgan@y.comInvite sent");
		expect(rowText("External", "pat@y.com")).toBe("pat@y.comNot invited");
		expect(rowText("External", "lee@y.com")).toBe("lee@y.comRevoked");
	});

	it("shows the server's error and recovers on refresh", async () => {
		respond(500, { error: "TestFlight is not configured" });
		render(<TestflightTestersDialog onClose={() => {}} />);
		expect((await screen.findByRole("alert")).textContent).toContain(
			"TestFlight is not configured",
		);

		respond(200, { ...testers, internal: [], external: [] });
		fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
		expect(await screen.findAllByText("No testers")).toHaveLength(2);
		expect(screen.queryByRole("alert")).toBeNull();
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});
});
