import WifiOffIcon from "@mui/icons-material/WifiOff";
import { Box, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useNowSeconds } from "../App/useNowSeconds";
import { hostLabel } from "./hostLabel";

const iconSx = {
	width: 52,
	height: 52,
	borderRadius: "14px",
	bgcolor: (t: Theme) => t.tokens.color.wash.error,
	color: "error.main",
	display: "grid",
	placeItems: "center",
} as const;

const codeSx = {
	fontFamily: "fontFamilyMono",
	fontSize: 12.5,
	lineHeight: 1.5,
	bgcolor: (t: Theme) => t.tokens.color.raised,
	border: 1,
	borderColor: "divider",
	borderRadius: 1,
	px: 1.25,
	py: 1,
	overflowWrap: "anywhere",
} as const;

type Props = { name: string; url: string; error: string; retryAt: number };

export function UnreachableDetails({ name, url, error, retryAt }: Props) {
	const now = useNowSeconds(1000);
	const retryIn = Math.max(0, Math.ceil(retryAt / 1000 - now));
	return (
		<>
			<Box sx={iconSx}>
				<WifiOffIcon />
			</Box>
			<Typography variant="h5" sx={{ fontWeight: 700 }}>
				Can't reach {name}
			</Typography>
			<Typography variant="body2" color="text.secondary">
				Check that Tailscale is connected on this phone and that the web server
				is running on {name}.
			</Typography>
			<Box sx={codeSx}>
				GET /api/health
				<br />
				{hostLabel(url)}
				<br />
				{error}
				{retryIn > 0 ? ` · retrying in ${retryIn}s` : " · retrying…"}
			</Box>
		</>
	);
}
