// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

function Boom(): never {
	throw new Error("kaboom");
}

describe("ErrorBoundary", () => {
	it("renders children when they do not throw", () => {
		render(
			<ErrorBoundary>
				<div>all good</div>
			</ErrorBoundary>,
		);

		expect(screen.getByText("all good")).toBeTruthy();
	});

	it("renders a fallback with the error message instead of unmounting", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});

		render(
			<ErrorBoundary>
				<Boom />
			</ErrorBoundary>,
		);

		expect(screen.getByText("Something went wrong")).toBeTruthy();
		expect(screen.getByText("kaboom")).toBeTruthy();
		spy.mockRestore();
	});
});
