// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NewsView } from "./NewsView";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function LocationProbe() {
	const location = useLocation();
	return <div>at {`${location.pathname}${location.search}`}</div>;
}

describe("NewsView", () => {
	it("links to the config page filtered to news", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: async () => [] }));
		render(
			<MemoryRouter initialEntries={["/news"]}>
				<Routes>
					<Route path="/news" element={<NewsView />} />
					<Route path="/config" element={<LocationProbe />} />
				</Routes>
			</MemoryRouter>,
		);

		const link = await waitFor(() =>
			screen.getByRole("link", { name: "News settings" }),
		);
		fireEvent.click(link);

		expect(screen.getByText("at /config?search=news")).toBeTruthy();
	});
});
