import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { UpdateState } from "../UpdateStateKind";
import { stackSx } from "./stackSx";
import { UpdateStateChip } from "./StateCell/UpdateStateChip";

export function StateCell({ state }: { state: UpdateState }) {
	return (
		<Box sx={{ ...stackSx, gridColumn: { xs: "2", sm: "auto" }, gap: 0.25 }}>
			<UpdateStateChip state={state} />
			<Typography variant="caption" color="text.secondary" noWrap>
				{state.line}
			</Typography>
		</Box>
	);
}
