import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import type { NextChip } from "../nextChips";
import { NextItemActions } from "../NextItemActions";
import { NextRepoRef } from "../NextRepoRef";

export function NextHero({
	chip,
	repo,
	number,
	title,
	facts,
	why,
	url,
	onStart,
}: {
	chip: NextChip;
	repo: string;
	number: number;
	title: string;
	facts: ReactNode;
	why: string;
	url: string;
	onStart: (cwd: string) => void;
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
					<NextRepoRef repo={repo} number={number} />
				</Stack>
				<Typography variant="h6" component="h2">
					{title}
				</Typography>
				{facts}
				<Typography sx={{ color: "text.secondary", maxWidth: "65ch" }}>
					{why}
				</Typography>
				<NextItemActions
					repo={repo}
					url={url}
					onStart={onStart}
					size="medium"
				/>
			</Stack>
		</Paper>
	);
}
