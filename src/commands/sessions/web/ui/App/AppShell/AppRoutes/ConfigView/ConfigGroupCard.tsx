import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import Typography from "@mui/material/Typography";
import { ConfigRow } from "./ConfigGroupCard/ConfigRow";
import type { ConfigGroup } from "./groupConfigEntries";

type Props = {
	group: ConfigGroup;
	cwd: string;
	onSaved: () => void;
	onError: (message: string) => void;
};

export function ConfigGroupCard({ group, cwd, onSaved, onError }: Props) {
	return (
		<Box>
			<Typography variant="h6" sx={{ mb: 1, fontFamily: "monospace" }}>
				{group.name}
			</Typography>
			<Paper variant="outlined">
				<Table size="small">
					<TableBody>
						{group.entries.map((entry) => (
							<ConfigRow
								key={entry.key}
								entry={entry}
								cwd={cwd}
								onSaved={onSaved}
								onError={onError}
							/>
						))}
					</TableBody>
				</Table>
			</Paper>
		</Box>
	);
}
