import BugReportIcon from "@mui/icons-material/BugReportOutlined";
import NoteAddIcon from "@mui/icons-material/NoteAddOutlined";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useRequestNewSession } from "../../../../../../../useRequestNewSession";

const buttonSx = { color: "primary.main" } as const;
const iconSx = { fontSize: 16 } as const;
const separatorSx = {
	width: "1px",
	height: 12,
	bgcolor: "divider",
	mx: 0.25,
	flexShrink: 0,
} as const;

export function AssistNewSessionButtons({
	id,
	cwd,
}: {
	id: string;
	cwd: string;
}) {
	const request = useRequestNewSession();
	const open = (mode: "draft" | "bug") =>
		request({ prompt: `From session ${id}`, cwd, mode });
	return (
		<>
			<IconButton
				size="small"
				title={`Draft in assist from session ${id}`}
				aria-label="Draft in assist"
				onClick={() => open("draft")}
				sx={buttonSx}
			>
				<NoteAddIcon sx={iconSx} />
			</IconButton>
			<IconButton
				size="small"
				title={`Bug in assist from session ${id}`}
				aria-label="Bug in assist"
				onClick={() => open("bug")}
				sx={buttonSx}
			>
				<BugReportIcon sx={iconSx} />
			</IconButton>
			<Box component="span" aria-hidden sx={separatorSx} />
		</>
	);
}
