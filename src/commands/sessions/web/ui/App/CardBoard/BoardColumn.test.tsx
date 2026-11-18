// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";
import { BoardColumn } from "./BoardColumn";

afterEach(() => {
	cleanup();
	localStorage.clear();
});

const sessions = [
	makeSessionInfo({
		id: "a",
		status: "waiting",
		title: "Alpha ask",
		cwd: "/git/alpha",
	}),
	makeSessionInfo({
		id: "b",
		status: "running",
		title: "Beta work",
		cwd: "/git/beta",
	}),
];

function renderColumn() {
	render(
		<BoardColumn
			sessions={sessions}
			openId={undefined}
			layout="full"
			onOpen={() => {}}
		/>,
	);
}

describe("BoardColumn", () => {
	it("shows each card's repo", () => {
		renderColumn();

		const repos = screen.getAllByTestId("card-repo").map((e) => e.textContent);
		expect(repos).toEqual(["alpha", "beta"]);
	});

	it("filters cards to the chosen repo and remembers it", () => {
		renderColumn();

		fireEvent.click(screen.getByRole("radio", { name: /beta/ }));

		expect(screen.queryByText("Alpha ask")).toBeNull();
		expect(screen.getByText("Beta work")).toBeTruthy();
		cleanup();
		renderColumn();
		expect(screen.queryByText("Alpha ask")).toBeNull();

		fireEvent.click(screen.getByRole("radio", { name: /All/ }));
		expect(screen.getByText("Alpha ask")).toBeTruthy();
	});
});
