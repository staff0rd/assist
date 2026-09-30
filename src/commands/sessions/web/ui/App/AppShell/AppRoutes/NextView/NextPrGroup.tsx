import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextPr, NextSection } from "../../../../../next/types";
import { NextPrRow } from "./NextPrGroup/NextPrRow";

export function NextPrGroup({
	section,
	hidden,
	onStart,
}: {
	section: NextSection<NextPr>;
	hidden?: NextPr;
	onStart: (pr: NextPr) => void;
}) {
	const rows = section.items.filter((pr) => pr !== hidden);
	if (rows.length === 0 && section.items.length > 0) return null;
	return (
		<Stack spacing={1} component="section">
			<Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
				<Chip label="Review" size="small" color="primary" variant="outlined" />
				<Typography variant="subtitle2" component="h3">
					Peer PRs awaiting your review
				</Typography>
				<Typography variant="body2" sx={{ color: "text.secondary" }}>
					{section.items.length}
				</Typography>
			</Stack>
			{section.error && <Alert severity="error">{section.error}</Alert>}
			{rows.length > 0 && (
				<Paper variant="outlined" sx={{ overflow: "hidden" }}>
					{rows.map((pr) => (
						<NextPrRow key={pr.number} pr={pr} onStart={() => onStart(pr)} />
					))}
				</Paper>
			)}
		</Stack>
	);
}
