import type { ReactElement } from "react";
import { ConfigListEditor } from "./ConfigNodeEditor/ConfigListEditor";
import type { ConfigNodeEditorProps } from "./ConfigNodeEditor/ConfigNodeEditorRenderer";
import { ConfigObjectEditor } from "./ConfigNodeEditor/ConfigObjectEditor";
import { ConfigObjectListEditor } from "./ConfigNodeEditor/ConfigObjectListEditor";
import { ConfigRecordEditor } from "./ConfigNodeEditor/ConfigRecordEditor";
import { ConfigScalarEditor } from "./ConfigNodeEditor/ConfigScalarEditor";
import { ConfigScalarText } from "./ConfigScalarText";
import { ConfigSecretInput } from "./ConfigNodeEditor/ConfigSecretInput";
import { ConfigVariantEditor } from "./ConfigNodeEditor/ConfigVariantEditor";

export function ConfigNodeEditor(props: ConfigNodeEditorProps): ReactElement {
	const { node, value } = props;
	if (node.secret) return <ConfigSecretInput {...props} />;
	switch (node.kind) {
		case "scalar":
			return <ConfigScalarEditor {...props} node={node} />;
		case "scalarList":
			return <ConfigListEditor {...props} node={node} />;
		case "object":
			return (
				<ConfigObjectEditor
					{...props}
					fields={node.fields}
					render={ConfigNodeEditor}
				/>
			);
		case "unionOfObjects":
			return (
				<ConfigVariantEditor {...props} node={node} render={ConfigNodeEditor} />
			);
		case "objectList":
			return (
				<ConfigObjectListEditor
					{...props}
					node={node}
					render={ConfigNodeEditor}
				/>
			);
		case "record":
			return (
				<ConfigRecordEditor {...props} node={node} render={ConfigNodeEditor} />
			);
		default:
			return <ConfigScalarText value={value} />;
	}
}
