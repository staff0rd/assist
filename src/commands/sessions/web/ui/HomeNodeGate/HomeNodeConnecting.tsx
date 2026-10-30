import { Box, CircularProgress, Typography } from "@mui/material";

export function HomeNodeConnecting({ name }: { name: string | undefined }) {
	return (
		<Box
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: 2,
				bgcolor: "background.default",
			}}
		>
			<CircularProgress size={28} />
			<Typography variant="body2" color="text.secondary">
				Connecting to {name ?? "home node"}…
			</Typography>
		</Box>
	);
}
