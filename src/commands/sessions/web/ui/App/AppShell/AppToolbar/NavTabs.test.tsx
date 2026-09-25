// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NavTabs } from "./NavTabs";

const configuredByCwd: Record<string, boolean> = {};
const fetchMock = vi.fn(async (url: string) => {
	const cwd = new URL(url, "http://localhost").searchParams.get("cwd") ?? "";
	return Response.json({ configured: configuredByCwd[cwd] ?? false });
});

beforeEach(() => {
	fetchMock.mockClear();
	vi.stubGlobal("fetch", fetchMock);
	configuredByCwd["/with"] = true;
	configuredByCwd["/without"] = false;
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function ui(cwd: string, path: string) {
	return (
		<MemoryRouter initialEntries={[path]}>
			<NavTabs cwd={cwd} />
		</MemoryRouter>
	);
}

function tabLabels(): string[] {
	return screen.getAllByRole("tab").map((t) => t.textContent ?? "");
}

function selectedLabel(): string | null {
	return (
		screen
			.getAllByRole("tab")
			.find((t) => t.getAttribute("aria-selected") === "true")?.textContent ??
		null
	);
}

describe("NavTabs", () => {
	it("shows the Releases tab when the repo declares release streams", async () => {
		render(ui("/with", "/sessions"));
		await waitFor(() =>
			expect(tabLabels()).toEqual(["Sessions", "Backlog", "Releases", "News"]),
		);
		expect(fetchMock).toHaveBeenCalledWith(
			"/api/releases/configured?cwd=%2Fwith",
		);
	});

	it("hides the Releases tab when the repo declares no release streams", async () => {
		render(ui("/without", "/sessions"));
		await waitFor(() => expect(fetchMock).toHaveBeenCalled());
		expect(tabLabels()).toEqual(["Sessions", "Backlog", "News"]);
	});

	it("keeps the Releases tab hidden while the check is pending", () => {
		render(ui("/with", "/sessions"));
		expect(tabLabels()).toEqual(["Sessions", "Backlog", "News"]);
	});

	it("keeps News highlighted on /news with the Releases tab hidden", async () => {
		render(ui("/without", "/news"));
		await waitFor(() => expect(fetchMock).toHaveBeenCalled());
		expect(selectedLabel()).toBe("News");
	});

	it("keeps News highlighted on /news with the Releases tab shown", async () => {
		render(ui("/with", "/news"));
		await waitFor(() => expect(tabLabels()).toContain("Releases"));
		expect(selectedLabel()).toBe("News");
	});

	it("updates visibility when the selected repo changes", async () => {
		const { rerender } = render(ui("/with", "/sessions"));
		await waitFor(() => expect(tabLabels()).toContain("Releases"));

		rerender(ui("/without", "/sessions"));
		expect(tabLabels()).not.toContain("Releases");

		rerender(ui("/with", "/sessions"));
		await waitFor(() => expect(tabLabels()).toContain("Releases"));
	});

	it("hides the Releases tab when the check fails", async () => {
		fetchMock.mockRejectedValueOnce(new Error("offline"));
		render(ui("/with", "/sessions"));
		await waitFor(() => expect(fetchMock).toHaveBeenCalled());
		expect(tabLabels()).toEqual(["Sessions", "Backlog", "News"]);
	});
});
