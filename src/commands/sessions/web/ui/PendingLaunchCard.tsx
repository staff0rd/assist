import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineRounded";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { cardSx } from "./cardSx";
import type { PendingLaunch } from "./PendingLaunch";

const containerSx = {
	...cardSx(false),
	cursor: "default",
	position: "relative",
} as const;
const closeSx = {
	position: "absolute",
	top: 4,
	right: 4,
	color: "text.disabled",
	"&:hover": { color: "text.primary" },
} as const;
const rowSx = { display: "flex", alignItems: "center", gap: 1, pr: 3 } as const;
const titleSx = { color: "text.primary", overflowWrap: "anywhere" } as const;

function captionSx(failed: boolean) {
	return {
		display: "block",
		mt: 0.5,
		color: failed ? "error.main" : "text.secondary",
		overflowWrap: "anywhere",
	} as const;
}

function launchingCaption(launch: PendingLaunch): string {
	return launch.windows
		? "Starting Windows session… (the Windows daemon may take a moment)"
		: "Starting session…";
}

export function PendingLaunchCard({
	launch,
	onDismiss,
}: {
	launch: PendingLaunch;
	onDismiss: (id: string) => void;
}) {
	const failed = launch.status === "error";
	return (
		<Box sx={containerSx}>
			<IconButton
				size="small"
				onClick={() => onDismiss(launch.id)}
				title="Dismiss"
				sx={closeSx}
			>
				<CloseIcon sx={{ fontSize: 16 }} />
			</IconButton>
			<Box sx={rowSx}>
				{failed ? (
					<ErrorOutlineIcon color="error" sx={{ fontSize: 18 }} />
				) : (
					<CircularProgress size={16} />
				)}
				<Typography variant="body2" sx={titleSx}>
					{launch.title}
				</Typography>
			</Box>
			<Typography variant="caption" sx={captionSx(failed)}>
				{failed ? launch.error : launchingCaption(launch)}
			</Typography>
		</Box>
	);
}
