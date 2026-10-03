// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../../../../../../test/mothers/makeSessionInfo";
import { ServingChip } from "./ServingChip";

afterEach(cleanup);

const serving = makeSessionInfo({
	commandType: "run",
	server: true,
	status: "running",
	cwd: "/home/me/repo",
});

describe("ServingChip", () => {
	it("links the port to localhost in a new tab", () => {
		render(<ServingChip session={{ ...serving, port: 5173 }} />);

		const link = screen.getByRole("link", { name: ":5173" });
		expect(link.getAttribute("href")).toBe("http://localhost:5173");
		expect(link.getAttribute("target")).toBe("_blank");
		expect(link.getAttribute("rel")).toBe("noopener noreferrer");
	});

	it("links a linked node's port to localhost", () => {
		render(<ServingChip session={{ ...serving, port: 3000, node: "box" }} />);

		expect(
			screen.getByRole("link", { name: ":3000" }).getAttribute("href"),
		).toBe("http://localhost:3000");
	});

	it("shows plain serving without a link when no port is known", () => {
		render(<ServingChip session={serving} />);

		expect(screen.getByText("serving")).toBeTruthy();
		expect(screen.queryByRole("link")).toBeNull();
	});

	it("does not bubble the port click to the card", () => {
		const onCardClick = vi.fn();
		render(
			<div onClick={onCardClick}>
				<ServingChip session={{ ...serving, port: 5173 }} />
			</div>,
		);

		fireEvent.click(screen.getByRole("link", { name: ":5173" }));

		expect(onCardClick).not.toHaveBeenCalled();
	});

	it("does not bubble the port mousedown to the card's ripple", () => {
		const onCardMouseDown = vi.fn();
		render(
			<div onMouseDown={onCardMouseDown}>
				<ServingChip session={{ ...serving, port: 5173 }} />
			</div>,
		);

		fireEvent.mouseDown(screen.getByRole("link", { name: ":5173" }));

		expect(onCardMouseDown).not.toHaveBeenCalled();
	});
});
