import Stack from "@mui/material/Stack";
import type {
	ConfigObjectListNode,
	ConfigScalarListNode,
} from "../../../../../../../../../shared/ConfigNode";
import { ConfigEntryBlock } from "../../ConfigEntryBlock";
import type { ConfigNodeRenderer } from "./ConfigNodeRenderer";
import { ConfigScalarText } from "../../ConfigScalarText";
import { EmptyConfigValue } from "../../EmptyConfigValue";

type Props = {
	node: ConfigScalarListNode | ConfigObjectListNode;
	value: unknown;
	render: ConfigNodeRenderer;
};

export function ConfigListValue({ node, value, render: Render }: Props) {
	if (!Array.isArray(value)) return <ConfigScalarText value={value} />;
	if (value.length === 0) return <EmptyConfigValue text="empty list" />;

	const item = node.item;
	if (node.kind === "scalarList")
		return (
			<Stack spacing={0}>
				{value.map((entry, index) => (
					<Render key={`${index}:${String(entry)}`} node={item} value={entry} />
				))}
			</Stack>
		);
	return (
		<Stack spacing={1}>
			{value.map((entry, index) => (
				<ConfigEntryBlock key={`[${index}]`}>
					<Render node={item} value={entry} />
				</ConfigEntryBlock>
			))}
		</Stack>
	);
}
