import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

export function PhoneNodeUpdateProgress({ busy }: { busy: string }) {
	return (
		<Box sx={{ px: 2.5, pt: 2 }} role="status">
			<Box sx={{ fontSize: 15, pb: 1 }}>{busy}…</Box>
			<LinearProgress />
		</Box>
	);
}
