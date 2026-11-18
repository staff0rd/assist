import { Button } from "@mui/material";
import { useNavigate } from "react-router";
import { sessionTextSize } from "../../../../sessions/web/ui/App/sessionTextSize";

type BackButtonProps = {
	to: string;
};

const backSx = {
	justifySelf: "start",
	minHeight: 0,
	minWidth: 0,
	p: 0,
	fontSize: sessionTextSize(12),
	fontWeight: 400,
	lineHeight: 1.5,
	"&:hover": { bgcolor: "transparent" },
} as const;

export function BackButton({ to }: BackButtonProps) {
	const navigate = useNavigate();
	return (
		<Button
			data-backlog-focus="back"
			variant="text"
			size="small"
			onClick={() => navigate(to)}
			sx={backSx}
		>
			&larr; Backlog
		</Button>
	);
}
