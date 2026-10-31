// @vitest-environment jsdom
import { act, cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../../../../../test/renderWithTheme";
import {
	clearClientFailures,
	recordClientFailure,
} from "../../../clientFailures/recordClientFailure";
import { ClientFailuresBadge } from "./ClientFailuresBadge";

beforeEach(() => {
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => new Response("{}")),
	);
});

afterEach(() => {
	cleanup();
	act(() => clearClientFailures());
	vi.unstubAllGlobals();
});

describe("ClientFailuresBadge", () => {
	it("is hidden when nothing has failed", () => {
		renderWithTheme(<ClientFailuresBadge />);
		expect(screen.queryByRole("button")).toBeNull();
	});

	it("lists recent failures in a panel and clears them", () => {
		renderWithTheme(<ClientFailuresBadge />);
		act(() =>
			recordClientFailure({
				at: "2026-10-31T01:02:03.000Z",
				method: "GET",
				path: "/api/new-session-defaults?node=mac",
				base: "https://home.ts.net:3100",
				node: "mac",
				status: 504,
				error: "Gateway Timeout",
				durationMs: 20012,
			}),
		);

		fireEvent.click(screen.getByRole("button", { name: "1 failed request" }));
		const panel = screen.getByRole("region", { name: "Recent failures" });
		expect(panel.textContent).toContain("/api/new-session-defaults?node=mac");
		expect(panel.textContent).toContain("mac");
		expect(panel.textContent).toContain("504 Gateway Timeout");
		expect(panel.textContent).toContain("20012ms");

		fireEvent.click(screen.getByRole("button", { name: "Clear" }));
		expect(screen.queryByRole("button", { name: /failed request/ })).toBeNull();
	});
});
