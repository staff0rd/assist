import Stack from "@mui/material/Stack";
import { useState } from "react";
import type { ConfigUnionOfObjectsNode } from "../../../../../../../../../../../../shared/ConfigNode";
import { asConfigRecord } from "../asConfigRecord";
import { ConfigEnumInput } from "./ConfigEnumInput";
import type { ConfigNodeEditorRenderer } from "./ConfigNodeEditorRenderer";
import { configVariantLabels } from "./ConfigVariantEditor/configVariantLabels";
import { EmptyConfigValue } from "../EmptyConfigValue";
import { keepVariantFields } from "./ConfigVariantEditor/keepVariantFields";
import { pickObjectVariantIndex } from "../pickObjectVariant";

type Props = {
	node: ConfigUnionOfObjectsNode;
	label: string;
	value: unknown;
	disabled: boolean;
	onChange: (value: unknown) => void;
	render: ConfigNodeEditorRenderer;
};

export function ConfigVariantEditor({
	node,
	label,
	value,
	disabled,
	onChange,
	render: Render,
}: Props) {
	const [picked, setPicked] = useState<number | undefined>(undefined);
	const labels = configVariantLabels(node.variants);
	const fields = Object.keys(asConfigRecord(value) ?? {});
	const derived = pickObjectVariantIndex(node.variants, value);
	const index = fields.length > 0 ? derived : (picked ?? derived);
	const variant = node.variants[index];
	if (!variant) return <EmptyConfigValue text="no variants" />;

	return (
		<Stack spacing={0.5}>
			<ConfigEnumInput
				label={`${label} type`}
				options={labels}
				value={labels[index]}
				disabled={disabled}
				onChange={(next) => {
					const at = labels.indexOf(next);
					setPicked(at);
					onChange(keepVariantFields(node.variants[at], value));
				}}
			/>
			<Render
				node={variant}
				label={label}
				value={value}
				disabled={disabled}
				onChange={onChange}
			/>
		</Stack>
	);
}
