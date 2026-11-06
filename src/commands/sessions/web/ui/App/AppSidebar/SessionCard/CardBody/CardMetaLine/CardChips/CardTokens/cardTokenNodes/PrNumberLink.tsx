import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { tokenBadgeSx } from "../../../../../../../../designSystem/tokenBadgeSx";

const sx = tokenBadgeSx("secondary");

export function PrNumberLink({
	prNumber,
	url,
}: {
	prNumber: number;
	url?: string;
}) {
	const label = `#${prNumber}`;

	if (!url)
		return (
			<Box component="span" sx={sx}>
				{label}
			</Box>
		);

	return (
		<Link
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			underline="hover"
			sx={sx}
			onMouseDown={(e) => e.stopPropagation()}
			onClick={(e) => e.stopPropagation()}
		>
			{label}
		</Link>
	);
}
