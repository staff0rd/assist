import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { NextItemActions } from "../NextItemActions";

export function NextRow({
	number,
	title,
	facts,
	url,
	onStart,
}: {
	number: number;
	title: string;
	facts: ReactNode;
	url: string;
	onStart: () => void;
}) {
	return (
		<Stack
			direction={{ xs: "column", sm: "row" }}
			spacing={1}
			sx={{
				px: 2,
				py: 1.25,
				alignItems: { sm: "center" },
				"& + &": { borderTop: 1, borderColor: "divider" },
			}}
		>
			<Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
				<Stack direction="row" spacing={1} sx={{ alignItems: "baseline" }}>
					<Typography
						variant="body2"
						sx={{ fontFamily: "monospace", color: "text.secondary" }}
					>
						#{number}
					</Typography>
					<Typography sx={{ fontWeight: 500, overflowWrap: "anywhere" }}>
						{title}
					</Typography>
				</Stack>
				{facts}
			</Stack>
			<NextItemActions url={url} onStart={onStart} />
		</Stack>
	);
}
