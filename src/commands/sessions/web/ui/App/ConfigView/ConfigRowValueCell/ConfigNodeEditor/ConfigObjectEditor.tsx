import Stack from "@mui/material/Stack";
import type { ConfigNode } from "../../../../../../../../shared/ConfigNode";
import { configNodeFieldName } from "../../../../../../../../shared/configNodeFieldName";
import { asConfigRecord } from "../asConfigRecord";
import { ConfigFieldRow } from "../ConfigFieldRow";
import type { ConfigNodeEditorRenderer } from "./ConfigNodeEditorRenderer";
import { setConfigField } from "./setConfigField";

type Props = {
	fields: ConfigNode[];
	label: string;
	value: unknown;
	disabled: boolean;
	onChange: (value: unknown) => void;
	render: ConfigNodeEditorRenderer;
};

export function ConfigObjectEditor({
	fields,
	label,
	value,
	disabled,
	onChange,
	render: Render,
}: Props) {
	const record = asConfigRecord(value) ?? {};

	return (
		<Stack spacing={0.5}>
			{fields.map((field) => {
				const name = configNodeFieldName(field);
				if (!name) return null;
				return (
					<ConfigFieldRow key={name} label={name}>
						<Render
							node={field}
							label={`${label}.${name}`}
							value={record[name]}
							disabled={disabled}
							onChange={(next) => onChange(setConfigField(record, name, next))}
						/>
					</ConfigFieldRow>
				);
			})}
		</Stack>
	);
}
