import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextPr } from "../../../../../../next/types";
import { NextItemActions } from "../NextItemActions";
import { NextPrFacts } from "../NextPrFacts";

export function NextPrRow({
	pr,
	onStart,
}: {
	pr: NextPr;
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
						#{pr.number}
					</Typography>
					<Typography sx={{ fontWeight: 500, overflowWrap: "anywhere" }}>
						{pr.title}
					</Typography>
				</Stack>
				<NextPrFacts pr={pr} />
			</Stack>
			<NextItemActions url={pr.url} onStart={onStart} />
		</Stack>
	);
}
