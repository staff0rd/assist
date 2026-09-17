import type { ConfigPath } from "./formatConfigPath";
import type {
	ConfigLeafType,
	ConfigScalarLeafType,
} from "./scalarUnionMembers";
import type { SchemaNode } from "./unwrapSchemaNode";

export type ConfigNodeBase = {
	path: ConfigPath;
	optional?: boolean;
	defaultValue?: unknown;
	secret?: true;
};

export type ConfigScalarNode = ConfigNodeBase & {
	kind: "scalar";
	type: ConfigScalarLeafType | "union";
	enumValues?: string[];
	enumDescriptions?: Record<string, string>;
	unionTypes?: ConfigScalarLeafType[];
};

export type ConfigScalarListNode = ConfigNodeBase & {
	kind: "scalarList";
	itemType: ConfigScalarLeafType;
	item: ConfigScalarNode;
};

export type ConfigObjectNode = ConfigNodeBase & {
	kind: "object";
	fields: ConfigNode[];
};

export type ConfigUnionOfObjectsNode = ConfigNodeBase & {
	kind: "unionOfObjects";
	variants: ConfigObjectNode[];
};

export type ConfigObjectListNode = ConfigNodeBase & {
	kind: "objectList";
	item: ConfigObjectNode | ConfigUnionOfObjectsNode;
};

export type ConfigRecordNode = ConfigNodeBase & {
	kind: "record";
	value: ConfigNode;
	keyValues?: string[];
	keyDescriptions?: Record<string, string>;
};

export type ConfigOpaqueNode = ConfigNodeBase & {
	kind: "other";
	type: ConfigLeafType;
};

export type ConfigNode =
	| ConfigScalarNode
	| ConfigScalarListNode
	| ConfigObjectNode
	| ConfigUnionOfObjectsNode
	| ConfigObjectListNode
	| ConfigRecordNode
	| ConfigOpaqueNode;

export type BuildConfigNode = (
	node: SchemaNode,
	path: ConfigPath,
) => ConfigNode;
