import Chip from "@mui/material/Chip";
import { Link, Typography } from "@mui/material";

const sx = { fontSize: "0.875rem" } as const;
const chipSx = { height: 18, fontSize: "0.65rem" } as const;

type TrackerLinkProps = {
	label: string;
	url?: string;
	variant?: "link" | "chip";
};

export function TrackerLink({
	label,
	url,
	variant = "link",
}: TrackerLinkProps) {
	if (variant === "chip") {
		if (!url)
			return (
				<Chip
					label={label}
					size="small"
					sx={chipSx}
					clickable={false}
					onClick={(e) => e.stopPropagation()}
				/>
			);
		return (
			<Chip
				label={label}
				size="small"
				sx={chipSx}
				clickable
				component="a"
				href={url}
				target="_blank"
				rel="noopener"
				onClick={(e) => e.stopPropagation()}
			/>
		);
	}

	if (!url) {
		return (
			<Typography variant="body2" color="text.disabled" sx={sx}>
				{label}
			</Typography>
		);
	}

	return (
		<Link
			href={url}
			target="_blank"
			rel="noopener"
			onClick={(e) => e.stopPropagation()}
			sx={sx}
		>
			{label}
		</Link>
	);
}
