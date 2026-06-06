import type { SxProps, Theme } from "@mui/material";
import { Typography } from "@mui/material";

const statusIcons: Record<string, string> = {
	todo: "○",
	"in-progress": "◔",
	done: "●",
	wontdo: "✕",
};

const statusColors: Record<string, string> = {
	todo: "text.disabled",
	"in-progress": "warning.main",
	done: "success.main",
	wontdo: "error.main",
};

function iconSx(status: string): SxProps<Theme> {
	return { fontSize: "1.125rem", flexShrink: 0, color: statusColors[status] };
}

export function StatusIcon({ status }: { status: string }) {
	return <Typography sx={iconSx(status)}>{statusIcons[status]}</Typography>;
}
