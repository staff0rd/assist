import type { ConfigScalarNode } from "../../../../../../../../../../../../shared/ConfigNode";
import { ConfigBooleanInput } from "./ConfigScalarEditor/ConfigBooleanInput";
import { ConfigEnumInput } from "./ConfigEnumInput";
import { ConfigTextInput } from "./ConfigScalarEditor/ConfigTextInput";

type Props = {
	node: ConfigScalarNode;
	label: string;
	value: unknown;
	disabled: boolean;
	onChange: (value: unknown) => void;
};

export function ConfigScalarEditor({
	node,
	label,
	value,
	disabled,
	onChange,
}: Props) {
	const text = value === undefined || value === null ? "" : String(value);

	if (node.type === "boolean") {
		return (
			<ConfigBooleanInput
				label={label}
				checked={value === true}
				disabled={disabled}
				onChange={onChange}
			/>
		);
	}
	if (node.type === "enum") {
		return (
			<ConfigEnumInput
				label={label}
				options={node.enumValues ?? []}
				value={text}
				disabled={disabled}
				onChange={onChange}
			/>
		);
	}
	return (
		<ConfigTextInput
			label={label}
			value={text}
			numeric={node.type === "number"}
			helperText={node.unionTypes?.join(" or ")}
			disabled={disabled}
			onChange={onChange}
		/>
	);
}
