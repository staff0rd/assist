import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { assistVersion } from "../../assistVersion";
import { NodeNameText } from "./NodeNameText";
import { NodeRowCells } from "./NodeRowCells";
import { nodeRowSx } from "./nodeRowSx";

export function ThisNodeRow({ name }: { name: string }) {
	return (
		<Box component="article" aria-label={name} sx={nodeRowSx()}>
			<NodeRowCells
				tone="ok"
				name={
					<>
						<NodeNameText name={name} />
						<Chip label="This node" size="small" variant="outlined" />
					</>
				}
				url={globalThis.location.origin}
				state="Running"
				caption={assistVersion ? `assist ${assistVersion}` : undefined}
			/>
		</Box>
	);
}
