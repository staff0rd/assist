import SyncIcon from "@mui/icons-material/Sync";
import { Box, Button } from "@mui/material";
import { Link as RouterLink } from "react-router";
import { formatItemId } from "../../../formatItemId";

const openIdSx = {
	fontFamily: "fontFamilyMono",
	color: "text.disabled",
	ml: 0.75,
} as const;

export function OpenRefreshDocsLink({ id, to }: { id: number; to: string }) {
	return (
		<Button
			variant="outlined"
			size="small"
			startIcon={<SyncIcon />}
			component={RouterLink}
			to={to}
		>
			Refresh docs
			<Box component="span" sx={openIdSx}>
				{formatItemId(id)}
			</Box>
		</Button>
	);
}
