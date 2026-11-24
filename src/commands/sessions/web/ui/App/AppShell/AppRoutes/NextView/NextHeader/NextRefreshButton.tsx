import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

export function NextRefreshButton({
	loading,
	refreshing,
	onRefresh,
}: {
	loading: boolean;
	refreshing: boolean;
	onRefresh: () => void;
}) {
	return (
		<Button
			variant="tonal"
			onClick={onRefresh}
			disabled={loading}
			startIcon={
				refreshing ? (
					<CircularProgress size={14} color="inherit" aria-label="Refreshing" />
				) : undefined
			}
		>
			{refreshing ? "Refreshing" : "Refresh"}
		</Button>
	);
}
