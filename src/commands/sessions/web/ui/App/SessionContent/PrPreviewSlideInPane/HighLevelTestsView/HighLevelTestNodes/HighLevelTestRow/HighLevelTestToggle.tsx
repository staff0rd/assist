import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Typography } from "@mui/material";
import { highLevelButtonResetSx } from "../../../highLevelTreeRowSx";
import type { HighLevelTestCase } from "../../../../../../../../../review/highLevel/types";
import { highLevelTestNameSx } from "../highLevelTestNameSx";
import { HighLevelTestChange } from "./HighLevelTestToggle/HighLevelTestChange";

export function HighLevelTestToggle({
	name,
	change,
	open,
	onToggle,
}: {
	name: string;
	change: HighLevelTestCase["change"];
	open: boolean;
	onToggle: () => void;
}) {
	const Chevron = open ? ExpandMoreIcon : ChevronRightIcon;
	return (
		<Box
			component="button"
			type="button"
			onClick={onToggle}
			aria-expanded={open}
			aria-label={`Show the source of ${name}`}
			sx={{
				display: "flex",
				alignItems: "center",
				gap: 0.5,
				flex: 1,
				minWidth: 0,
				p: 0,
				...highLevelButtonResetSx,
			}}
		>
			<Chevron sx={{ fontSize: 15, color: "text.secondary", flexShrink: 0 }} />
			<HighLevelTestChange change={change} />
			<Typography
				component="span"
				sx={{
					...highLevelTestNameSx,
					...(change === "removed" ? { color: "text.secondary" } : {}),
				}}
				title={name}
			>
				{name}
			</Typography>
		</Box>
	);
}
