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
		in?: SchemaNode;
		out?: SchemaNode;
	};
};

const OPTIONAL_TYPES = new Set(["optional", "nullish"]);

function isPreprocess(def: NonNullable<SchemaNode["def"]>): boolean {
	return def.type === "pipe" && def.in?.def?.type === "transform";
}

function wrappedNode(node: SchemaNode): SchemaNode | undefined {
	const def = node.def;
	if (!def) return undefined;
	if (WRAPPER_TYPES.has(def.type ?? "")) return def.innerType;
	if (isPreprocess(def)) return def.out;
	return undefined;
}

export function unwrapSchemaNode(node: SchemaNode): {
	inner: SchemaNode;
	defaultValue?: unknown;
	optional: boolean;
} {
	let current = node;
	let defaultValue: unknown;
	let optional = false;
	for (let next = wrappedNode(current); next; next = wrappedNode(current)) {
		if (current.def?.type === "default" && defaultValue === undefined) {
			defaultValue = current.def.defaultValue;
		}
		if (OPTIONAL_TYPES.has(current.def?.type ?? "")) optional = true;
		current = next;
	}
	return { inner: current, defaultValue, optional };
}
