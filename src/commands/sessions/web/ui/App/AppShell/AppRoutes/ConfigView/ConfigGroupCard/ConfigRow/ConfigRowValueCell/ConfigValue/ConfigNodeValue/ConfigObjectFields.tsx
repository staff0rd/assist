import Stack from "@mui/material/Stack";
import type { ConfigNode } from "../../../../../../../../../../../../../shared/ConfigNode";
import { configNodeFieldName } from "../../../../../../../../../../../../../shared/configNodeFieldName";
import { ConfigFieldRow } from "../../ConfigFieldRow";
import type { ConfigNodeRenderer } from "./ConfigNodeRenderer";
import { ConfigScalarText } from "../../ConfigScalarText";
import { EmptyConfigValue } from "../../EmptyConfigValue";

type Props = {
	fields: ConfigNode[];
	value: unknown;
	render: ConfigNodeRenderer;
};

type SetField = { name: string; node: ConfigNode; value: unknown };

function setFields(fields: ConfigNode[], value: object): SetField[] {
	const record = value as Record<string, unknown>;
	const out: SetField[] = [];
	for (const node of fields) {
		const name = configNodeFieldName(node);
		if (!name) continue;
		const fieldValue =
			record[name] === undefined ? node.defaultValue : record[name];
		if (fieldValue === undefined) continue;
		out.push({ name, node, value: fieldValue });
	}
	return out;
}

export function ConfigObjectFields({ fields, value, render: Render }: Props) {
	if (typeof value !== "object" || value === null)
		return <ConfigScalarText value={value} />;

	const shown = setFields(fields, value);
	if (shown.length === 0) return <EmptyConfigValue text="no values set" />;
	return (
		<Stack spacing={0.25}>
			{shown.map((field) => (
				<ConfigFieldRow key={field.name} label={field.name}>
					<Render node={field.node} value={field.value} />
				</ConfigFieldRow>
			))}
		</Stack>
	);
}
