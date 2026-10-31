// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { PhoneBackButton } from "./PhoneBackButton";

afterEach(cleanup);

describe("PhoneBackButton", () => {
	it("is chevron-only, labelled with its destination", () => {
		render(
			<MemoryRouter initialEntries={["/session/1"]}>
				<Routes>
					<Route path="/" element={<div>root</div>} />
					<Route
						path="/session/:id"
						element={<PhoneBackButton label="Sessions" to="/" />}
					/>
				</Routes>
			</MemoryRouter>,
		);
		const button = screen.getByRole("button", { name: "Back to Sessions" });
		expect(button.textContent).toBe("");
		fireEvent.click(button);
		expect(screen.getByText("root")).toBeTruthy();
	});
});
