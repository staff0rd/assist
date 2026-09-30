import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import type { NextChip } from "../nextChips";
import { NextItemActions } from "../NextItemActions";

export function NextHero({
	chip,
	number,
	title,
	facts,
	why,
	url,
	onStart,
}: {
	chip: NextChip;
	number: number;
	title: string;
	facts: ReactNode;
	why: string;
	url: string;
	onStart: () => void;
}) {
	return (
		<Paper variant="outlined" sx={{ p: 2.5 }}>
			<Stack spacing={1.5}>
				<Typography
					variant="overline"
					sx={{ color: "text.secondary", lineHeight: 1.5 }}
				>
					Your next best action
				</Typography>
				<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
					<Chip
						label={chip.label}
						size="small"
						color={chip.color}
						variant="outlined"
					/>
					<Typography
						variant="body2"
						sx={{ fontFamily: "monospace", color: "text.secondary" }}
					>
						#{number}
					</Typography>
				</Stack>
				<Typography variant="h6" component="h2">
					{title}
				</Typography>
				{facts}
				<Typography sx={{ color: "text.secondary", maxWidth: "65ch" }}>
					{why}
				</Typography>
				<NextItemActions url={url} onStart={onStart} size="medium" />
			</Stack>
		</Paper>
	);
}
