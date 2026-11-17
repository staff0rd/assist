// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import MenuList from "@mui/material/MenuList";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReviewMenuRow } from "./ReviewMenuRow";

afterEach(cleanup);

describe("ReviewMenuRow", () => {
	it("keeps a hidden slot for a harness the row lacks so columns line up", () => {
		const onSelect = vi.fn();
		const { container } = render(
			<MenuList>
				<ReviewMenuRow
					entry={{
						label: "High-level review",
						args: ["review", "--high-level"],
						alternates: [
							{
								harness: "codex-sdk",
								args: ["review", "--high-level", "--harness", "codex-sdk"],
							},
						],
						columns: ["codex", "codex-sdk"],
					}}
					onSelect={onSelect}
				/>
			</MenuList>,
		);

		const slots = [...container.querySelectorAll("button")];
		expect(slots.map((b) => b.textContent)).toEqual(["Codex", "Codex (SDK)"]);
		expect(slots[0].disabled).toBe(true);
		expect(screen.getByTitle("High-level review").textContent).toBe(
			"High-level review",
		);

		fireEvent.click(
			screen.getByRole("button", {
				name: "Run High-level review on Codex (SDK)",
			}),
		);
		expect(onSelect.mock.calls[0][1]).toEqual([
			"review",
			"--high-level",
			"--harness",
			"codex-sdk",
		]);
	});
});
