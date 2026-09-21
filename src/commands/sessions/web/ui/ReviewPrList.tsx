import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import { useState } from "react";
import type { PrSummary } from "../prList";
import { dropdownStyle } from "./DropdownWrapper";
import { FilterInput } from "./FilterInput";
import { filterPrs } from "./filterPrs";
import { useOpenPrs } from "./useOpenPrs";
import { PrRow } from "./PrRow";
import { Message } from "./Message";

export function ReviewPrList({
	cwd,
	onPick,
}: {
	cwd: string;
	onPick: (pr: PrSummary) => void;
}) {
	const { prs, loading } = useOpenPrs(cwd);
	const [filter, setFilter] = useState("");
	const filtered = filterPrs(prs, filter);

	return (
		<Paper
			elevation={4}
			sx={{
				...dropdownStyle,
				left: "auto",
				width: 320,
				maxHeight: "none",
				overflowY: "visible",
			}}
		>
			{loading ? (
				<Message text="Loading open PRs…" />
			) : prs.length === 0 ? (
				<Message text="No open PRs" />
			) : (
				<>
					<FilterInput
						value={filter}
						onChange={setFilter}
						placeholder="Filter PRs..."
					/>
					{filtered.length === 0 ? (
						<Message text="No PRs match" />
					) : (
						<MenuList
							dense
							disablePadding
							sx={{ maxHeight: 200, overflowY: "auto" }}
						>
							{filtered.map((pr) => (
								<PrRow key={pr.number} pr={pr} onPick={onPick} />
							))}
						</MenuList>
					)}
				</>
			)}
		</Paper>
	);
}
