import Box from "@mui/material/Box";
import { statusPillSx } from "../../designSystem/statusPillSx";

export function PendingPill({ label }: { label: string }) {
	return (
		<Box
			component="span"
			sx={[
				statusPillSx("warning.main"),
				{
					ml: 1,
					verticalAlign: "middle",
					"&::before": {
						content: '""',
						width: 6,
						height: 6,
						borderRadius: "50%",
						bgcolor: "currentColor",
					},
				},
			]}
		>
			{label} awaiting approval
		</Box>
	);
}
