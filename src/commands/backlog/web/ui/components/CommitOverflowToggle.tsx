import { Link } from "@mui/material";

const toggleSx = {
	color: "text.secondary",
	alignSelf: "flex-start",
	textAlign: "left",
} as const;

export function CommitOverflowToggle({
	hiddenCount,
	expanded,
	onToggle,
}: {
	hiddenCount: number;
	expanded: boolean;
	onToggle: () => void;
}) {
	if (hiddenCount === 0) return null;
	return (
		<Link
			component="button"
			type="button"
			variant="body2"
			underline="hover"
			sx={toggleSx}
			onClick={(e) => {
				e.stopPropagation();
				onToggle();
			}}
		>
			{expanded ? "Show fewer commits" : `… and ${hiddenCount} more commits`}
		</Link>
	);
}
