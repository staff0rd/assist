import { Box, Button } from "@mui/material";
import { useState } from "react";
import { safeAreaInsets } from "../designSystem/safeAreaInsets";
import { PhoneNavBar } from "../PhoneShell/PhoneNavBar";
import { PhoneNodeChip } from "../PhoneShell/PhoneNodeChip";
import {
	type NodesSheetView,
	PhoneNodesSheet,
} from "../PhoneShell/PhoneNodesSheet";
import type { SavedNode } from "./SavedNode";
import { SwitchHomeNode } from "./SwitchHomeNode";
import { UnreachableDetails } from "./UnreachableDetails";
import type { HomeNodeApi } from "./useHomeNode";

const bodySx = {
	flex: 1,
	minHeight: 0,
	overflowY: "auto",
	display: "flex",
	flexDirection: "column",
	gap: 1.75,
	px: 2.5,
	pt: 3,
	pb: `calc(${safeAreaInsets.bottom} + 24px)`,
} as const;

type Props = {
	homeNode: HomeNodeApi;
	home: SavedNode;
	error: string;
	retryAt: number;
};

export function HomeNodeUnreachable({ homeNode, home, error, retryAt }: Props) {
	const [sheet, setSheet] = useState<NodesSheetView | null>(null);

	return (
		<Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
			<PhoneNavBar
				left={
					<PhoneNodeChip
						name={home.name}
						tone="error"
						onClick={() => setSheet({ kind: "list" })}
					/>
				}
				title=""
			/>
			<Box sx={bodySx}>
				<UnreachableDetails
					name={home.name}
					url={home.url}
					error={error}
					retryAt={retryAt}
				/>
				<Button variant="contained" size="large" onClick={homeNode.retry}>
					Retry now
				</Button>
				<SwitchHomeNode
					nodes={homeNode.nodes.filter((n) => n.url !== home.url)}
					onConnect={homeNode.choose}
					onAdd={() => setSheet({ kind: "add" })}
				/>
			</Box>
			<PhoneNodesSheet view={sheet} onView={setSheet} />
		</Box>
	);
}
