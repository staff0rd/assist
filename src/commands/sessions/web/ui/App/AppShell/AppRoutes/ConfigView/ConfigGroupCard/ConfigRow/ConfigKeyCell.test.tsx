// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import { afterEach, describe, expect, it } from "vitest";
import type { ConfigEntry } from "../../../../../../../../../config/readConfigEntries";
import { ConfigKeyCell } from "./ConfigKeyCell";

afterEach(cleanup);

function renderCell(entry: Partial<ConfigEntry>, readOnly = false) {
	const full = {
		key: "backup.dir",
		type: "string",
		value: undefined,
		source: "default",
		...entry,
	} as ConfigEntry;
	render(
		<Table>
			<TableBody>
				<TableRow>
					<ConfigKeyCell entry={full} readOnly={readOnly} />
				</TableRow>
			</TableBody>
		</Table>,
	);
}

describe("ConfigKeyCell", () => {
	it("shows the configHelp note under the key", () => {
		renderCell({ note: "directory dumps are written to" });

		expect(screen.getByText("backup.dir")).toBeTruthy();
		expect(screen.getByText("directory dumps are written to")).toBeTruthy();
	});

	it("dims the note so it reads as secondary to the key", () => {
		renderCell({ note: "directory dumps are written to" });

		const note = screen.getByText("directory dumps are written to");
		const key = screen.getByText("backup.dir");

		expect(getComputedStyle(note).color).not.toBe(getComputedStyle(key).color);
	});

	it("renders only the key when no note is documented", () => {
		renderCell({ setter: "assist config set backup.dir ~/x" });

		expect(screen.getByRole("cell").textContent).toBe("backup.dir");
	});

	it("surfaces the setter for read-only keys that cannot be edited here", () => {
		renderCell(
			{ note: "named MSSQL connections", setter: "assist sql auth add" },
			true,
		);

		expect(screen.getByText("assist sql auth add")).toBeTruthy();
	});

	it("hides the setter for editable keys", () => {
		renderCell({ note: "named MSSQL connections", setter: "assist sql auth" });

		expect(screen.queryByText("assist sql auth")).toBeNull();
	});
});
