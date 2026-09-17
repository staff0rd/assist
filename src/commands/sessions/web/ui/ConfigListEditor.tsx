import type { ConfigScalarListNode } from "../../../../shared/ConfigNode";
import { ConfigEnumListInput } from "./ConfigEnumListInput";
import { ConfigListInput } from "./ConfigListInput";

type Props = {
	node: ConfigScalarListNode;
	label: string;
	value: unknown;
	disabled: boolean;
	onChange: (value: unknown) => void;
};

export function ConfigListEditor({
	node,
	label,
	value,
	disabled,
	onChange,
}: Props) {
	if (node.item.enumValues) {
		return (
			<ConfigEnumListInput
				label={label}
				options={node.item.enumValues}
				value={value}
				disabled={disabled}
				onChange={onChange}
			/>
		);
	}
	return (
		<ConfigListInput
			label={label}
			value={value}
			disabled={disabled}
			onChange={onChange}
		/>
	);
}
