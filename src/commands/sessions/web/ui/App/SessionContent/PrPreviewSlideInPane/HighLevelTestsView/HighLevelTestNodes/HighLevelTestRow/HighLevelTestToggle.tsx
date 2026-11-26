import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Typography } from "@mui/material";
import { highLevelButtonResetSx } from "../../../highLevelTreeRowSx";
import type { HighLevelTestCase } from "../../../../../../../../../review/highLevel/types";
import { HighLevelTestKeyword } from "../HighLevelTestKeyword";
import { highLevelTestNameSx } from "../highLevelTestNameSx";
import { HighLevelTestChange } from "./HighLevelTestToggle/HighLevelTestChange";

export function HighLevelTestToggle({
	name,
	writtenName,
	change,
	open,
	onToggle,
}: {
	name: string;
	writtenName?: string | undefined;
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
			aria-label={`Show the source of ${writtenName ?? name}`}
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
				title={writtenName === undefined ? name : `As written: ${writtenName}`}
			>
				{writtenName === undefined ? (
					name
				) : (
					<>
						<HighLevelTestKeyword word="it" /> {name}
					</>
				)}
			</Typography>
		</Box>
	);
}
