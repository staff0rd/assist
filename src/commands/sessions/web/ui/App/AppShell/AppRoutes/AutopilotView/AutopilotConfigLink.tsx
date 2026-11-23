import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router";

export function AutopilotConfigLink() {
	return (
		<Link
			component={RouterLink}
			to="/config?search=autopilot"
			underline="hover"
			variant="body2"
		>
			Autopilot settings
		</Link>
	);
}
