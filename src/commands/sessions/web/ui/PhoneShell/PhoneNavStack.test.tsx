// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import {
	cleanup,
	createEvent,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import {
	type Location,
	MemoryRouter,
	Route,
	Routes,
	useNavigate,
} from "react-router";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createDesignTheme } from "../designSystem/createDesignTheme";
import type { SessionSocket } from "../useSessionSocket";
import { PhoneBackButton } from "./PhoneBackButton";
import { PhoneNavStack } from "./PhoneNavStack";

function Open({ to }: { to: string }) {
	const navigate = useNavigate();
	return (
		<button type="button" onClick={() => navigate(to)}>
			open {to}
		</button>
	);
}

vi.mock("../isNativeApp", () => ({ isNativePlatform: true }));

const sheet = vi.hoisted(() => ({ open: false }));

vi.mock("./PhoneRoutes", () => ({
	PhoneRoutes: ({ location }: { location: Location }) => (
		<Routes location={location}>
			<Route
				path="/"
				element={
					<div data-phone-scroll="" data-testid="home-scroll">
						<Open to="/backlog/a1" />
					</div>
				}
			/>
			<Route path="/backlog" element={<div>backlog list</div>} />
			<Route
				path="/backlog/:id"
				element={
					<>
						<PhoneBackButton />
						<Open to="/session/s1" />
					</>
				}
			/>
			<Route
				path="/session/:id"
				element={
					<>
						<PhoneBackButton />
						<Drawer anchor="bottom" open={sheet.open}>
							sheet
						</Drawer>
					</>
				}
			/>
		</Routes>
	),
}));

afterEach(() => {
	cleanup();
	sheet.open = false;
});

beforeAll(() => {
	Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
		configurable: true,
		get: () => 400,
	});
});

function touch(
	type: "touchStart" | "touchMove" | "touchEnd",
	x: number,
	timeStamp: number,
) {
	const event = createEvent[type](document, {
		touches: type === "touchEnd" ? [] : [{ clientX: x, clientY: 300 }],
		cancelable: true,
	});
	Object.defineProperty(event, "timeStamp", { value: timeStamp });
	fireEvent(document, event);
}

function swipe(toX: number) {
	touch("touchStart", 5, 0);
	touch("touchMove", 20, 100);
	touch("touchMove", toX, 1000);
	touch("touchEnd", toX, 2000);
}

const onSession = () =>
	screen.queryByRole("button", { name: "Back to a1", hidden: true }) !== null;

const socket = { sessions: [], history: [] } as unknown as SessionSocket;

function renderAt(...entries: string[]) {
	render(
		<ThemeProvider theme={createDesignTheme("dark", "touch")}>
			<MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
				<PhoneNavStack
					socket={socket}
					keyboardOpen={false}
					onOpenNodes={() => undefined}
					onNewSession={() => undefined}
				/>
			</MemoryRouter>
		</ThemeProvider>,
	);
}

const tap = (name: string) =>
	fireEvent.click(screen.getByRole("button", { name }));

describe("PhoneNavStack", () => {
	it("keeps the page beneath mounted and pops back to it", () => {
		renderAt("/");
		tap("open /backlog/a1");
		tap("open /session/s1");
		expect(
			screen.getByText("open /session/s1", { selector: "button" }),
		).toBeTruthy();
		tap("Back to a1");
		expect(screen.queryByRole("button", { name: "Back to a1" })).toBeNull();
		tap("open /session/s1");
		expect(screen.getByRole("button", { name: "Back to a1" })).toBeTruthy();
	});

	it("labels Back with the page beneath", () => {
		renderAt("/");
		tap("open /backlog/a1");
		expect(
			screen.getByRole("button", { name: "Back to Sessions" }),
		).toBeTruthy();
	});

	it("goes to the owning tab root when nothing is beneath", () => {
		renderAt("/backlog/a1");
		tap("Back to Backlog");
		expect(screen.getByText("backlog list")).toBeTruthy();
	});

	it("swipes back to the page beneath past halfway", async () => {
		renderAt("/");
		tap("open /backlog/a1");
		tap("open /session/s1");
		swipe(300);
		await waitFor(() => expect(onSession()).toBe(false));
		expect(
			screen.getByText("open /session/s1", { selector: "button" }),
		).toBeTruthy();
	});

	it("cancels a swipe released before halfway", async () => {
		renderAt("/");
		tap("open /backlog/a1");
		tap("open /session/s1");
		swipe(150);
		await new Promise((r) => setTimeout(r, 0));
		expect(onSession()).toBe(true);
	});

	it("swipes to the owning tab root when nothing is beneath", async () => {
		renderAt("/backlog/a1");
		swipe(300);
		await waitFor(() => expect(screen.getByText("backlog list")).toBeTruthy());
	});

	it("ignores a swipe while a sheet is open", async () => {
		sheet.open = true;
		renderAt("/");
		tap("open /backlog/a1");
		tap("open /session/s1");
		swipe(300);
		await new Promise((r) => setTimeout(r, 0));
		expect(onSession()).toBe(true);
	});

	it("restores the scroll of a page that unmounted while deeper", async () => {
		renderAt("/");
		screen.getByTestId("home-scroll").scrollTop = 240;
		tap("open /backlog/a1");
		tap("open /session/s1");
		expect(screen.queryByTestId("home-scroll")).toBeNull();
		tap("Back to a1");
		tap("Back to Sessions");
		expect(screen.getByTestId("home-scroll").scrollTop).toBe(240);
	});

	it("ignores a swipe on a tab root", async () => {
		renderAt("/");
		swipe(300);
		await new Promise((r) => setTimeout(r, 0));
		expect(
			screen.getByRole("button", { name: "open /backlog/a1" }),
		).toBeTruthy();
	});
});
