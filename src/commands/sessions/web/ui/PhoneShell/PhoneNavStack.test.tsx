// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
	type Location,
	MemoryRouter,
	Route,
	Routes,
	useNavigate,
} from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
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

vi.mock("./PhoneRoutes", () => ({
	PhoneRoutes: ({ location }: { location: Location }) => (
		<Routes location={location}>
			<Route path="/" element={<Open to="/backlog/a1" />} />
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
			<Route path="/session/:id" element={<PhoneBackButton />} />
		</Routes>
	),
}));

afterEach(cleanup);

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
});
