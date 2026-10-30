import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { AddNodeRow } from "./AddNodeRow";
import { hostLabel } from "./hostLabel";
import { NodeDot } from "./NodeDot";
import { nodeListSx } from "./nodeListSx";
import { probeSummary } from "./probeSummary";
import type { SavedNode } from "./SavedNode";
import { useNodeProbes } from "./useNodeProbes";

type Props = {
	nodes: SavedNode[];
	onConnect: (url: string) => void;
	onAdd: () => void;
};

export function OtherNodesList({ nodes, onConnect, onAdd }: Props) {
	const probes = useNodeProbes(nodes.map((n) => n.url));
	return (
		<Box sx={[nodeListSx.group, { mx: 0 }]}>
			{nodes.map((node) => {
				const summary = probeSummary(probes[node.url]);
				return (
					<ButtonBase
						key={node.url}
						sx={nodeListSx.item}
						onClick={() => onConnect(node.url)}
					>
						<NodeDot tone={summary.tone} />
						<Box component="span" sx={nodeListSx.grow}>
							{node.name}
							<Box component="span" sx={nodeListSx.detail}>
								{hostLabel(node.url)} · {summary.text}
							</Box>
						</Box>
						<Box component="span" sx={{ color: "primary.main", fontSize: 14 }}>
							Connect
						</Box>
					</ButtonBase>
				);
			})}
			<AddNodeRow onAdd={onAdd} />
		</Box>
	);
}
