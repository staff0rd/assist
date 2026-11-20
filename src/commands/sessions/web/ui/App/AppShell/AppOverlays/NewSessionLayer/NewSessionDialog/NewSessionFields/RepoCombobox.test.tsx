// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { RepoCombobox } from "./RepoCombobox";

afterEach(cleanup);

describe("RepoCombobox", () => {
	it("turns off browser autocomplete", () => {
		render(
			<RepoCombobox
				repos={["/git/a"]}
				value=""
				onChange={() => {}}
				inputRef={createRef()}
				autoFocus={false}
				onTrack={() => {}}
			/>,
		);
		expect(
			screen
				.getByRole("combobox", { name: "Repo" })
				.getAttribute("autocomplete"),
		).toBe("off");
	});
});
