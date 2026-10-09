import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Typography } from "@mui/material";
import { highLevelButtonResetSx } from "../../highLevelTreeRowSx";
import { highLevelTestNameSx } from "../highLevelTestNameSx";

export function HighLevelTestToggle({
	name,
	open,
	onToggle,
}: {
	name: string;
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
			<Typography component="span" sx={highLevelTestNameSx} title={name}>
				{name}
			</Typography>
		</Box>
	);
}
