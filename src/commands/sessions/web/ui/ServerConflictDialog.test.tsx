// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ServerConflictDialog } from "./ServerConflictDialog";
import type { ServerConflict } from "./useNotices";

afterEach(cleanup);

function conflict(existing: ServerConflict["existing"]): ServerConflict {
	return { existing, runName: "web", cwd: "/b" };
}

describe("ServerConflictDialog", () => {
	it("names the group it would displace in the title", () => {
		render(
			<ServerConflictDialog
				conflict={conflict({ id: "1", name: "run: api", group: "api" })}
				onConfirm={() => {}}
				onCancel={() => {}}
			/>,
		);

		expect(screen.getByRole("heading").textContent).toBe(
			"Replace the api server?",
		);
	});

	it("names the group slot alongside the port and repo", () => {
		render(
			<ServerConflictDialog
				conflict={conflict({
					id: "1",
					name: "run: api",
					cwd: "/home/me/git/assist",
					port: 3000,
					group: "api",
				})}
				onConfirm={() => {}}
				onCancel={() => {}}
			/>,
		);

		expect(screen.getByText(/already serving/).textContent).toContain(
			"on port 3000 in assist, holding the api server slot",
		);
	});

	it("falls back to the unnamed wording when no group is known", () => {
		render(
			<ServerConflictDialog
				conflict={conflict({ id: "1", name: "run: dev", port: 3000 })}
				onConfirm={() => {}}
				onCancel={() => {}}
			/>,
		);

		expect(screen.getByRole("heading").textContent).toBe(
			"Replace running server?",
		);
		expect(screen.getByText(/already serving/).textContent).toContain(
			'"run: dev" is already serving on port 3000.',
		);
	});
});
