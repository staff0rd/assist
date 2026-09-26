// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NavTabs } from "./NavTabs";

const configuredByCwd: Record<string, boolean> = {};
let showNewsInNav = false;
const fetchMock = vi.fn(async (url: string) => {
	const parsed = new URL(url, "http://localhost");
	if (parsed.pathname === "/api/news/nav")
		return Response.json({ showInNav: showNewsInNav });
	const cwd = parsed.searchParams.get("cwd") ?? "";
	return Response.json({ configured: configuredByCwd[cwd] ?? false });
});

function releasesChecked() {
	expect(fetchMock).toHaveBeenCalledWith(
		expect.stringContaining("/api/releases/configured"),
	);
}

beforeEach(() => {
	fetchMock.mockClear();
	vi.stubGlobal("fetch", fetchMock);
	configuredByCwd["/with"] = true;
	configuredByCwd["/without"] = false;
	showNewsInNav = false;
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function CurrentPath() {
	return <output data-testid="path">{useLocation().pathname}</output>;
}

function ui(cwd: string, path: string) {
	return (
		<MemoryRouter initialEntries={[path]}>
			<NavTabs cwd={cwd} />
			<CurrentPath />
		</MemoryRouter>
	);
}

function currentPath(): string {
	return screen.getByTestId("path").textContent ?? "";
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
			expect(tabLabels()).toEqual(["Sessions", "Backlog", "Releases"]),
		);
		expect(fetchMock).toHaveBeenCalledWith(
			"/api/releases/configured?cwd=%2Fwith",
		);
	});

	it("hides the Releases tab when the repo declares no release streams", async () => {
		render(ui("/without", "/sessions"));
		await waitFor(releasesChecked);
		expect(tabLabels()).toEqual(["Sessions", "Backlog"]);
	});

	it("keeps the Releases tab hidden while the check is pending", () => {
		render(ui("/with", "/sessions"));
		expect(tabLabels()).toEqual(["Sessions", "Backlog"]);
	});

	it("hides the News tab by default", async () => {
		render(ui("/without", "/sessions"));
		await waitFor(() =>
			expect(fetchMock).toHaveBeenCalledWith("/api/news/nav"),
		);
		expect(tabLabels()).not.toContain("News");
	});

	it("shows the News tab when news.showInNav is enabled", async () => {
		showNewsInNav = true;
		render(ui("/with", "/sessions"));
		await waitFor(() =>
			expect(tabLabels()).toEqual(["Sessions", "Backlog", "Releases", "News"]),
		);
	});

	it("highlights no tab on /news with the News tab hidden", async () => {
		render(ui("/without", "/news"));
		await waitFor(() =>
			expect(fetchMock).toHaveBeenCalledWith("/api/news/nav"),
		);
		expect(currentPath()).toBe("/news");
		expect(selectedLabel()).toBeNull();
	});

	it("keeps News highlighted on /news with the Releases tab hidden", async () => {
		showNewsInNav = true;
		render(ui("/without", "/news"));
		await waitFor(() => expect(tabLabels()).toContain("News"));
		expect(selectedLabel()).toBe("News");
	});

	it("keeps News highlighted on /news with the Releases tab shown", async () => {
		showNewsInNav = true;
		render(ui("/with", "/news"));
		await waitFor(() =>
			expect(tabLabels()).toEqual(["Sessions", "Backlog", "Releases", "News"]),
		);
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
		await waitFor(releasesChecked);
		expect(tabLabels()).toEqual(["Sessions", "Backlog"]);
	});

	it("redirects a deep link under /releases to /sessions when not configured", async () => {
		render(ui("/without", "/releases/some/stream"));
		await waitFor(() => expect(currentPath()).toBe("/sessions"));
	});

	it("stays on /releases when configured", async () => {
		render(ui("/with", "/releases"));
		await waitFor(() => expect(tabLabels()).toContain("Releases"));
		expect(currentPath()).toBe("/releases");
		expect(selectedLabel()).toBe("Releases");
	});

	it("redirects /releases to /sessions after switching to an unconfigured repo", async () => {
		const { rerender } = render(ui("/with", "/releases"));
		await waitFor(() => expect(tabLabels()).toContain("Releases"));

		rerender(ui("/without", "/releases"));
		await waitFor(() => expect(currentPath()).toBe("/sessions"));
	});

	it("does not redirect while the check is pending or when it fails", async () => {
		fetchMock.mockRejectedValueOnce(new Error("offline"));
		render(ui("/without", "/releases"));
		expect(currentPath()).toBe("/releases");
		await waitFor(() => expect(fetchMock).toHaveBeenCalled());
		await Promise.resolve();
		expect(currentPath()).toBe("/releases");
	});

	it("leaves routes that merely share the prefix alone", async () => {
		render(ui("/without", "/releasesx"));
		await waitFor(() => expect(fetchMock).toHaveBeenCalled());
		expect(currentPath()).toBe("/releasesx");
	});
});
