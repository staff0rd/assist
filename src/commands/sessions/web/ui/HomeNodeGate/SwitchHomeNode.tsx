import Box from "@mui/material/Box";
import { nodeListSx } from "./nodeListSx";
import { OtherNodesList } from "./OtherNodesList";
import type { SavedNode } from "./SavedNode";

type Props = {
	nodes: SavedNode[];
	onConnect: (url: string) => void;
	onAdd: () => void;
};

export function SwitchHomeNode({ nodes, onConnect, onAdd }: Props) {
	return (
		<>
			<Box sx={[nodeListSx.label, { px: 0, pt: 1.25 }]}>Switch home node</Box>
			<OtherNodesList nodes={nodes} onConnect={onConnect} onAdd={onAdd} />
		</>
	);
}
