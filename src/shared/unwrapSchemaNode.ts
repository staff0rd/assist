const WRAPPER_TYPES = new Set([
	"optional",
	"default",
	"nullable",
	"nullish",
	"readonly",
	"catch",
]);

export type SchemaNode = {
	def?: {
		type?: string;
		innerType?: SchemaNode;
		shape?: Record<string, SchemaNode>;
		defaultValue?: unknown;
		entries?: Record<string, unknown>;
		options?: SchemaNode[];
		element?: SchemaNode;
		keyType?: SchemaNode;
		valueType?: SchemaNode;
	};
};

const OPTIONAL_TYPES = new Set(["optional", "nullish"]);

export function unwrapSchemaNode(node: SchemaNode): {
	inner: SchemaNode;
	defaultValue?: unknown;
	optional: boolean;
} {
	let current = node;
	let defaultValue: unknown;
	let optional = false;
	while (
		current.def &&
		WRAPPER_TYPES.has(current.def.type ?? "") &&
		current.def.innerType
	) {
		if (current.def.type === "default" && defaultValue === undefined) {
			defaultValue = current.def.defaultValue;
		}
		if (OPTIONAL_TYPES.has(current.def.type ?? "")) optional = true;
		current = current.def.innerType;
	}
	return { inner: current, defaultValue, optional };
}
