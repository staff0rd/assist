import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router";

export function BackupsLink({
	warn,
	tooltip,
	children,
}: {
	warn: boolean;
	tooltip: string;
	children: ReactNode;
}) {
	return (
		<Tooltip title={tooltip}>
			<Link
				component={RouterLink}
				to="/backups"
				underline="hover"
				color={warn ? "warning.main" : "text.secondary"}
				variant="body2"
				sx={
					warn
						? { display: "inline-flex", alignItems: "center", gap: 0.5 }
						: undefined
				}
			>
				{warn && <WarningAmberIcon fontSize="inherit" />}
				{children}
			</Link>
		</Tooltip>
	);
}
