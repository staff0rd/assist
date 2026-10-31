import Box from "@mui/material/Box";
import type { BacklogItem } from "../../../../../backlog/web/ui/types";
import { statusPillSx } from "../../designSystem/statusPillSx";
import { tokenBadgeSx } from "../../designSystem/tokenBadgeSx";

const chipsSx = {
	display: "flex",
	flexWrap: "wrap",
	alignItems: "center",
	gap: 0.75,
	px: 2,
	pt: 1,
} as const;

const statusColor: Record<BacklogItem["status"], string> = {
	todo: "text.secondary",
	"in-progress": "success.main",
	done: "info.main",
	wontdo: "error.main",
};

export function PhoneItemChips({
	item,
	node,
}: {
	item: BacklogItem;
	node: string | undefined;
}) {
	return (
		<Box sx={chipsSx}>
			<Box
				component="span"
				sx={tokenBadgeSx(item.type === "bug" ? "secondary" : "neutral")}
			>
				{item.type}
			</Box>
			<Box component="span" sx={statusPillSx(statusColor[item.status])}>
				{item.status.replace("-", " ")}
			</Box>
			{node && (
				<Box component="span" sx={tokenBadgeSx("neutral")}>
					{node}
				</Box>
			)}
		</Box>
	);
}
