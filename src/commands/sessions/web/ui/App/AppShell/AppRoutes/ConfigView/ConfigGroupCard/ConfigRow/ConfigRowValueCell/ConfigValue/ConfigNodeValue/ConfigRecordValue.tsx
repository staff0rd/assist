import Stack from "@mui/material/Stack";
import type { ConfigRecordNode } from "../../../../../../../../../../../../../shared/ConfigNode";
import { ConfigFieldRow } from "../../ConfigFieldRow";
import type { ConfigNodeRenderer } from "./ConfigNodeRenderer";
import { ConfigScalarText } from "../../ConfigScalarText";
import { EmptyConfigValue } from "../../EmptyConfigValue";

type Props = {
	node: ConfigRecordNode;
	value: unknown;
	render: ConfigNodeRenderer;
};

export function ConfigRecordValue({ node, value, render: Render }: Props) {
	if (typeof value !== "object" || value === null || Array.isArray(value))
		return <ConfigScalarText value={value} />;

	const entries = Object.entries(value);
	if (entries.length === 0) return <EmptyConfigValue text="no entries" />;
	return (
		<Stack spacing={0.5}>
			{entries.map(([key, entryValue]) => (
				<ConfigFieldRow key={key} label={key}>
					<Render node={node.value} value={entryValue} />
				</ConfigFieldRow>
			))}
		</Stack>
	);
}
