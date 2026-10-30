import Box from "@mui/material/Box";
import { AddNodeRow } from "../../HomeNodeGate/AddNodeRow";
import { hostLabel } from "../../HomeNodeGate/hostLabel";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import { probeSummary } from "../../HomeNodeGate/probeSummary";
import type { SavedNode } from "../../HomeNodeGate/SavedNode";
import type { HomeNodeApi } from "../../HomeNodeGate/useHomeNode";
import { useNodeProbes } from "../../HomeNodeGate/useNodeProbes";
import { homeNodeDetail } from "./homeNodeDetail";
import { SavedNodeRow } from "./SavedNodeRow";

type Props = {
	homeNode: HomeNodeApi;
	onChoose: (url: string) => void;
	onEdit: (node: SavedNode) => void;
	onAdd: () => void;
};

export function PhoneSavedNodes({ homeNode, onChoose, onEdit, onAdd }: Props) {
	const { connection } = homeNode;
	const homeUrl = homeNode.home?.url;
	const probes = useNodeProbes(
		homeNode.nodes.filter((n) => n.url !== homeUrl).map((n) => n.url),
	);

	const rowProps = (node: SavedNode) => {
		if (node.url === homeUrl)
			return {
				tone: connection.kind === "connected" ? "ok" : "error",
				detail: homeNodeDetail(connection, node.url),
			} as const;
		const summary = probeSummary(probes[node.url]);
		return {
			tone: summary.tone,
			detail: `${hostLabel(node.url)} · ${summary.text}`,
		};
	};

	return (
		<Box sx={nodeListSx.group}>
			{homeNode.nodes.map((node) => (
				<SavedNodeRow
					key={node.url}
					name={node.name}
					selected={node.url === homeUrl}
					onChoose={() => onChoose(node.url)}
					onEdit={() => onEdit(node)}
					{...rowProps(node)}
				/>
			))}
			<AddNodeRow onAdd={onAdd} />
		</Box>
	);
}
