import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextPr } from "../../../../../next/types";
import { nextPrWhy } from "./NextHero/nextPrWhy";
import { NextItemActions } from "./NextItemActions";
import { NextPrFacts } from "./NextPrFacts";

export function NextHero({
	pr,
	waiting,
	onStart,
}: {
	pr: NextPr;
	waiting: number;
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
						label="Review"
						size="small"
						color="primary"
						variant="outlined"
					/>
					<Typography
						variant="body2"
						sx={{ fontFamily: "monospace", color: "text.secondary" }}
					>
						#{pr.number}
					</Typography>
				</Stack>
				<Typography variant="h6" component="h2">
					{pr.title}
				</Typography>
				<NextPrFacts pr={pr} />
				<Typography sx={{ color: "text.secondary", maxWidth: "65ch" }}>
					{nextPrWhy(pr, waiting)}
				</Typography>
				<NextItemActions url={pr.url} onStart={onStart} size="medium" />
			</Stack>
		</Paper>
	);
}
