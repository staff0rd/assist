import MenuList from "@mui/material/MenuList";
import type { PrSummary } from "../../../../../../../../prList";
import { PrRow } from "./PrMenuList/PrRow";

export function PrMenuList({
	prs,
	highlight,
	onHighlight,
	onPick,
}: {
	prs: PrSummary[];
	highlight: number;
	onHighlight: (index: number) => void;
	onPick: (pr: PrSummary) => void;
}) {
	return (
		<MenuList dense disablePadding sx={{ maxHeight: 200, overflowY: "auto" }}>
			{prs.map((pr, index) => (
				<PrRow
					key={pr.number}
					pr={pr}
					highlighted={index === highlight}
					onHover={() => onHighlight(index)}
					onPick={onPick}
				/>
			))}
		</MenuList>
	);
}
