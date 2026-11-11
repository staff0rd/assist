// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nodesRoutes } from "./nodesRoutes";

vi.mock("./NodesView", () => ({ NodesView: () => <div>nodes page</div> }));

afterEach(cleanup);

describe("nodesRoutes", () => {
	it("redirects /updates to the nodes page", () => {
		render(
			<MemoryRouter initialEntries={["/updates"]}>
				<Routes>{nodesRoutes(() => {})}</Routes>
			</MemoryRouter>,
		);
		expect(screen.getByText("nodes page")).toBeTruthy();
	});
});
