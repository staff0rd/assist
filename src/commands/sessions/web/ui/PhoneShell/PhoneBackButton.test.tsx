// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { PhoneBackButton } from "./PhoneBackButton";
import { PhoneStackPageContext } from "./PhoneNavStack/usePhoneStackPage";

afterEach(cleanup);

function Root() {
	const { state } = useLocation();
	return <div>{state?.phoneBack ? "root via back" : "root"}</div>;
}

function renderAt(beneath: boolean) {
	const page = {
		isCurrent: true,
		beneath: beneath
			? { pathname: "/history", search: "", hash: "", state: null, key: "h" }
			: undefined,
		beneathLabel: beneath ? "History" : undefined,
	};
	return render(
		<MemoryRouter initialEntries={["/history", "/session/1"]} initialIndex={1}>
			<Routes>
				<Route path="/" element={<Root />} />
				<Route path="/history" element={<div>history</div>} />
				<Route
					path="/session/:id"
					element={
						<PhoneStackPageContext.Provider value={page}>
							<PhoneBackButton />
						</PhoneStackPageContext.Provider>
					}
				/>
			</Routes>
		</MemoryRouter>,
	);
}

describe("PhoneBackButton", () => {
	it("is chevron-only, labelled with the page beneath, and pops to it", () => {
		renderAt(true);
		const button = screen.getByRole("button", { name: "Back to History" });
		expect(button.textContent).toBe("");
		fireEvent.click(button);
		expect(screen.getByText("history")).toBeTruthy();
	});

	it("replaces with the owning tab root when nothing is beneath", () => {
		renderAt(false);
		fireEvent.click(screen.getByRole("button", { name: "Back to Sessions" }));
		expect(screen.getByText("root via back")).toBeTruthy();
	});
});
