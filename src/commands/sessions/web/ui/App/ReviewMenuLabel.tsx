import Box from "@mui/material/Box";
import { reviewAlternateSx } from "./reviewAlternateSx";

export function ReviewMenuLabel({
	label,
	caption,
}: {
	label: string;
	caption?: string | undefined;
}) {
	return (
		<Box component="span" sx={reviewAlternateSx.label}>
			<Box component="span" sx={reviewAlternateSx.labelText} title={label}>
				{label}
			</Box>
			{caption && (
				<Box component="span" sx={reviewAlternateSx.caption} title={caption}>
					{caption}
				</Box>
			)}
		</Box>
	);
}
