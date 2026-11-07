import ChevronRight from "@mui/icons-material/ChevronRight";
import ListItemButton from "@mui/material/ListItemButton";
import { listRowHeight } from "../../../designSystem/listRowHeight";

const citeSx = {
	flex: "none",
	minHeight: listRowHeight,
	borderRadius: 1,
	justifyContent: "space-between",
	color: "primary.main",
} as const;

export function CiteRuleRow({ onClick }: { onClick: () => void }) {
	return (
		<ListItemButton sx={citeSx} onClick={onClick}>
			Cite a rule
			<ChevronRight />
		</ListItemButton>
	);
}
