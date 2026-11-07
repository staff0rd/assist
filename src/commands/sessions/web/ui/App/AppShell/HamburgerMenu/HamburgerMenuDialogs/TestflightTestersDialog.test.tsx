// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
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

const withJoined: TestflightTesters = {
	...testers,
	internal: [
		{ email: "jo@x.com", team: "joined", testflight: "not-in-group" },
		{ email: "alex@x.com", team: "pending", testflight: "not-in-group" },
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

	it("adds an internal tester, toasts the outcome and refreshes", async () => {
		respond(200, withJoined);
		render(<TestflightTestersDialog onClose={() => {}} />);
		await screen.findByText("com.example.app");

		const add = screen.getByRole("button", { name: "Add" });
		expect((add as HTMLButtonElement).disabled).toBe(true);
		fireEvent.change(screen.getByLabelText("Tester email"), {
			target: { value: " new@x.com " },
		});
		fireEvent.click(screen.getByRole("switch", { name: "Internal" }));

		let resolve: (res: Response) => void = () => {};
		fetchMock.mockReturnValueOnce(
			new Promise<Response>((r) => {
				resolve = r;
			}),
		);
		fireEvent.click(add);
		await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
		const [url, init] = fetchMock.mock.calls[1];
		expect(String(url)).toContain("/api/testflight/testers");
		expect(init.method).toBe("POST");
		expect(JSON.parse(init.body)).toEqual({
			email: "new@x.com",
			internal: true,
		});
		expect((add as HTMLButtonElement).disabled).toBe(true);
		expect(
			(
				screen.getByRole("button", {
					name: "Add to group",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);

		respond(200, testers);
		resolve(
			Response.json({
				result: "invited",
				message: "Sent new@x.com an App Store Connect team invite.",
				waiting: false,
			}),
		);
		expect(
			await screen.findByText(
				"Sent new@x.com an App Store Connect team invite.",
			),
		).toBeTruthy();
		await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
		expect(fetchMock.mock.calls[2][1]?.method).toBeUndefined();
		expect(
			(screen.getByLabelText("Tester email") as HTMLInputElement).value,
		).toBe("");
	});

	it("adds a joined member to the internal group from their row", async () => {
		respond(200, withJoined);
		render(<TestflightTestersDialog onClose={() => {}} />);
		await screen.findByText("com.example.app");

		expect(
			screen.getAllByRole("button", { name: "Add to group" }),
		).toHaveLength(1);
		respond(200, {
			result: "created",
			message: 'Invited jo@x.com to TestFlight group "testers"',
			waiting: false,
		});
		respond(200, testers);
		fireEvent.click(screen.getByRole("button", { name: "Add to group" }));

		expect(
			await screen.findByText('Invited jo@x.com to TestFlight group "testers"'),
		).toBeTruthy();
		expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
			email: "jo@x.com",
			internal: true,
		});
		await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
	});

	it("shows an add error and keeps the email", async () => {
		respond(200, testers);
		render(<TestflightTestersDialog onClose={() => {}} />);
		await screen.findByText("com.example.app");

		fireEvent.change(screen.getByLabelText("Tester email"), {
			target: { value: "new@x.com" },
		});
		respond(500, { error: "API key lacks the Admin role" });
		fireEvent.click(screen.getByRole("button", { name: "Add" }));

		expect(
			await screen.findByText("API key lacks the Admin role"),
		).toBeTruthy();
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(
			(screen.getByLabelText("Tester email") as HTMLInputElement).value,
		).toBe("new@x.com");
	});

	it("spins the refresh button while reloading", async () => {
		respond(200, testers);
		render(<TestflightTestersDialog onClose={() => {}} />);
		await screen.findByText("com.example.app");
		expect(screen.queryByLabelText("Refreshing")).toBeNull();

		let resolve: (res: Response) => void = () => {};
		fetchMock.mockReturnValueOnce(
			new Promise<Response>((r) => {
				resolve = r;
			}),
		);
		fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
		expect(screen.getByLabelText("Refreshing")).toBeTruthy();

		resolve(Response.json(testers));
		await waitFor(() =>
			expect(screen.queryByLabelText("Refreshing")).toBeNull(),
		);
	});
});
