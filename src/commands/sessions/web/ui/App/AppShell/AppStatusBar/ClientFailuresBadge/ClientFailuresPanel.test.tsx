// @vitest-environment jsdom
import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../../../../../../test/renderWithTheme";
import type { ClientFailure } from "../../../../../../shared/ClientFailure";
import { ClientFailuresPanel } from "./ClientFailuresPanel";
import { withFailureBugContexts } from "./withFailureBugContexts";

afterEach(cleanup);

const failure: ClientFailure = {
	at: "2026-10-31T01:02:03.000Z",
	method: "GET",
	path: "/api/git-status",
	base: "https://home.ts.net:3100",
	node: "mac",
	status: 504,
	error: "Gateway Timeout",
	durationMs: 20012,
};

function renderPanel(
	origins: Record<string, string>,
	cloneOn?: Parameters<typeof withFailureBugContexts>[2],
) {
	const onLaunched = vi.fn();
	const { ui, launchAssist } = withFailureBugContexts(
		origins,
		<ClientFailuresPanel
			failures={[failure]}
			onClear={() => {}}
			onLaunched={onLaunched}
		/>,
		cloneOn,
	);
	renderWithTheme(ui);
	return { launchAssist, onLaunched };
}

describe("ClientFailuresPanel bug button", () => {
	it("launches /bug in assist's clone with the failure as the prompt", () => {
		const { launchAssist, onLaunched } = renderPanel({
			"/git/selected": "github.com/someone/else",
			"/git/assist": "github.com/staff0rd/assist",
		});
		fireEvent.click(screen.getByRole("button", { name: "Report bug" }));

		expect(launchAssist).toHaveBeenCalledTimes(1);
		const [args, cwd, meta] = launchAssist.mock.calls[0];
		expect(args.slice(0, 2)).toEqual(["bug", "--once"]);
		expect(args[2]).toContain("Path: /api/git-status");
		expect(args[2]).toContain("Status: 504");
		expect(args[2]).toContain(`Page URL: ${globalThis.location.href}`);
		expect(cwd).toBe("/git/assist");
		expect(meta).toEqual({ node: "mac", title: "Bug: GET /api/git-status" });
		expect(onLaunched).toHaveBeenCalled();
	});

	it("disables the button with an explaining tooltip when there is no local clone of assist", async () => {
		const { launchAssist } = renderPanel({
			"/git/selected": "github.com/someone/else",
		});
		const button = screen.getByRole("button", { name: "Report bug" });
		expect((button as HTMLButtonElement).disabled).toBe(true);
		fireEvent.click(button);
		expect(launchAssist).not.toHaveBeenCalled();

		fireEvent.mouseOver(button.parentElement as HTMLElement);
		expect((await screen.findByRole("tooltip")).textContent).toBe(
			"No local clone of staff0rd/assist on mac to report the bug in",
		);
	});

	it("launches in the selected node's clone when another node's clone is listed", () => {
		const { launchAssist } = renderPanel(
			{ "/home/me/git/assist": "github.com/staff0rd/assist" },
			(cwd, node) =>
				cwd === "/home/me/git/assist" && node === "mac"
					? "/Users/me/git/assist"
					: undefined,
		);
		fireEvent.click(screen.getByRole("button", { name: "Report bug" }));

		const [, cwd, meta] = launchAssist.mock.calls[0];
		expect(cwd).toBe("/Users/me/git/assist");
		expect(meta.node).toBe("mac");
	});

	it("disables the button when only another node has an assist clone", () => {
		const { launchAssist } = renderPanel(
			{ "/home/me/git/assist": "github.com/staff0rd/assist" },
			() => undefined,
		);
		const button = screen.getByRole("button", { name: "Report bug" });
		expect((button as HTMLButtonElement).disabled).toBe(true);
		fireEvent.click(button);
		expect(launchAssist).not.toHaveBeenCalled();
	});
});
