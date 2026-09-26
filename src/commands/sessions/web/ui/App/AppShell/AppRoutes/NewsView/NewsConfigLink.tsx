import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router";

export function NewsConfigLink() {
	return (
		<Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
			<Link
				component={RouterLink}
				to="/config?search=news"
				underline="hover"
				variant="body2"
			>
				News settings
			</Link>
		</Box>
	);
}
