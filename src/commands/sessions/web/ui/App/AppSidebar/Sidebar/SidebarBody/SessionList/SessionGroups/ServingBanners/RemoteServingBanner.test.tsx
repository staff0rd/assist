// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionInfo } from "../../../../../../../types";
import { RemoteServingBanner } from "./RemoteServingBanner";

afterEach(cleanup);

const serving: SessionInfo = {
	id: "1",
	name: "dev",
	commandType: "run",
	server: true,
	status: "running",
	startedAt: 0,
	cwd: "/home/me/repo",
};

describe("RemoteServingBanner", () => {
	it("links the port to localhost in a new tab", () => {
		render(
			<RemoteServingBanner
				serving={{ ...serving, port: 5173 }}
				onJump={vi.fn()}
			/>,
		);

		const link = screen.getByRole("link", { name: ":5173" });
		expect(link.getAttribute("href")).toBe("http://localhost:5173");
		expect(link.getAttribute("target")).toBe("_blank");
		expect(link.getAttribute("rel")).toBe("noopener noreferrer");
	});

	it("keeps the full label as the title", () => {
		render(
			<RemoteServingBanner
				serving={{ ...serving, port: 5173 }}
				onJump={vi.fn()}
			/>,
		);

		expect(screen.getByTitle("serving :5173 · repo · dev")).toBeTruthy();
	});

	it("shows plain serving without a link when no port is known", () => {
		render(<RemoteServingBanner serving={serving} onJump={vi.fn()} />);

		expect(screen.getByTitle("serving · repo · dev")).toBeTruthy();
		expect(screen.queryByRole("link")).toBeNull();
	});

	it("does not trigger Jump when the port is clicked", () => {
		const onJump = vi.fn();
		const onParentClick = vi.fn();
		render(
			<div onClick={onParentClick}>
				<RemoteServingBanner
					serving={{ ...serving, port: 5173 }}
					onJump={onJump}
				/>
			</div>,
		);

		fireEvent.click(screen.getByRole("link", { name: ":5173" }));

		expect(onJump).not.toHaveBeenCalled();
		expect(onParentClick).not.toHaveBeenCalled();
	});
});
