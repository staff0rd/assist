import { Box, Button, CircularProgress } from "@mui/material";

export function GapStatus({
	hidden,
	header,
	from,
	elsewhere,
	loading,
	error,
	onRetry,
}: {
	hidden: number | null;
	header: string | undefined;
	from: string | undefined;
	elsewhere?: string | undefined;
	loading: boolean;
	error: string | undefined;
	onRetry: () => void;
}) {
	if (loading)
		return (
			<Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
				<CircularProgress size={14} aria-label="Loading" />
				Loading file{from ? ` from ${from}` : ""}…
			</Box>
		);
	if (error)
		return (
			<Box component="span" sx={{ color: "error.main", whiteSpace: "normal" }}>
				Couldn't load this file{from ? ` from ${from}` : ""}: {error}{" "}
				<Button size="small" onClick={onRetry} sx={{ minWidth: 0, py: 0 }}>
					Retry
				</Button>
			</Box>
		);
	return (
		<>
			{hidden === null
				? "More lines below"
				: `${hidden} hidden line${hidden === 1 ? "" : "s"}`}{" "}
			{elsewhere ? (
				<Box component="span" sx={{ color: "text.secondary" }}>
					· {elsewhere}
				</Box>
			) : (
				header && (
					<Box component="span" sx={{ color: "text.disabled" }}>
						{header}
					</Box>
				)
			)}
		</>
	);
}
