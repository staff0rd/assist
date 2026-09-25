import type { ReactElement } from "react";
import type { ConfigNode } from "../../../../../../../../shared/ConfigNode";
import { ConfigListValue } from "./ConfigNodeValue/ConfigListValue";
import { ConfigObjectFields } from "./ConfigNodeValue/ConfigObjectFields";
import { ConfigRecordValue } from "./ConfigNodeValue/ConfigRecordValue";
import { ConfigScalarText } from "../ConfigScalarText";
import { maskedSecretText } from "../maskedSecretText";
import { pickObjectVariant } from "../pickObjectVariant";

type Props = {
	node: ConfigNode;
	value: unknown;
};

export function ConfigNodeValue({ node, value }: Props): ReactElement {
	if (node.secret) return <ConfigScalarText value={maskedSecretText} />;
	switch (node.kind) {
		case "object":
			return (
				<ConfigObjectFields
					fields={node.fields}
					value={value}
					render={ConfigNodeValue}
				/>
			);
		case "unionOfObjects": {
			const variant = pickObjectVariant(node.variants, value);
			if (!variant) return <ConfigScalarText value={value} />;
			return (
				<ConfigObjectFields
					fields={variant.fields}
					value={value}
					render={ConfigNodeValue}
				/>
			);
		}
		case "scalarList":
		case "objectList":
			return (
				<ConfigListValue node={node} value={value} render={ConfigNodeValue} />
			);
		case "record":
			return (
				<ConfigRecordValue node={node} value={value} render={ConfigNodeValue} />
			);
		default:
			return <ConfigScalarText value={value} />;
	}
}
