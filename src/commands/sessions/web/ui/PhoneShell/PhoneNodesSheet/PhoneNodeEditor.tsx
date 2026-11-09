import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { NodeForm } from "../../HomeNodeGate/NodeForm";
import type { SavedNode } from "../../HomeNodeGate/SavedNode";
import type { HomeNodeApi } from "../../HomeNodeGate/useHomeNode";

type Props = {
	homeNode: HomeNodeApi;
	node: SavedNode | undefined;
	onDone: () => void;
};

export function PhoneNodeEditor({ homeNode, node, onDone }: Props) {
	const save = async (next: SavedNode) => {
		const clash = homeNode.nodes.some(
			(n) => n.url === next.url && n.url !== node?.url,
		);
		if (clash) return "That URL is already saved";
		homeNode.saveNode(node?.url ?? next.url, next);
		onDone();
		return undefined;
	};

	return (
		<Box sx={{ px: 2.5, pt: 1 }}>
			<NodeForm
				initial={node}
				submitLabel={node ? "Save" : "Add node"}
				onSubmit={save}
			>
				{node && (
					<Button
						color="error"
						size="large"
						onClick={() => {
							homeNode.removeNode(node.url);
							onDone();
						}}
					>
						Delete node
					</Button>
				)}
			</NodeForm>
		</Box>
	);
}
