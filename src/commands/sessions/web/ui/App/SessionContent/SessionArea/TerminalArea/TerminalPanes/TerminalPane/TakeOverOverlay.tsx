import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";

export function TakeOverOverlay({
	activeNode,
	onTakeOver,
}: {
	activeNode?: string;
	onTakeOver: () => void;
}) {
	return (
		<ButtonBase
			onClick={onTakeOver}
			sx={{
				position: "absolute",
				inset: 0,
				bgcolor: "background.default",
				"&:hover .take-over-label": { color: "text.primary" },
			}}
		>
			<Typography
				className="take-over-label"
				variant="body2"
				color="text.secondary"
			>
				Active on {activeNode ?? "another viewer"} — click to take over
			</Typography>
		</ButtonBase>
	);
}
