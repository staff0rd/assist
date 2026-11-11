import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import type { NodeRowData } from "../../nodeRows";
import { ConnectionFacts } from "./ConnectionPanel/ConnectionFacts";
import { LinkProblem } from "./ConnectionPanel/LinkProblem";
import { Panel } from "./Panel";

export function ConnectionPanel({
	row,
	onRemove,
}: {
	row: NodeRowData;
	onRemove: () => void;
}) {
	const { link } = row;
	return (
		<Panel title="Connection">
			<ConnectionFacts row={row} />
			{link ? (
				<>
					<LinkProblem link={link} />
					<Box>
						<Button size="small" color="inherit" onClick={onRemove}>
							Remove node
						</Button>
					</Box>
				</>
			) : (
				<Typography variant="body2" color="text.secondary">
					Other nodes link to this one by its sessions.nodeName.
				</Typography>
			)}
		</Panel>
	);
}
