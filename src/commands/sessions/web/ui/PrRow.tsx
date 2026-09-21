import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { PrSummary } from "../prList";
import { formatRelativeTime } from "./formatRelativeTime";

export function PrRow({
	pr,
	onPick,
}: {
	pr: PrSummary;
	onPick: (pr: PrSummary) => void;
}) {
	return (
		<MenuItem
			onMouseDown={(e) => e.preventDefault()}
			onClick={() => onPick(pr)}
			sx={{ alignItems: "flex-start", py: 0.75, whiteSpace: "normal" }}
		>
			<Stack spacing={0.25} sx={{ minWidth: 0 }}>
				<Typography sx={{ fontSize: 13, lineHeight: 1.3, fontWeight: 500 }}>
					{pr.title}
				</Typography>
				<Typography sx={{ fontSize: 11, color: "text.secondary" }}>
					#{pr.number} · {pr.author} · {formatRelativeTime(pr.createdAt)}
				</Typography>
			</Stack>
		</MenuItem>
	);
}
