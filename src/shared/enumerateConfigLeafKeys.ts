import type { z } from "zod";

const WRAPPER_TYPES = new Set([
	"optional",
	"default",
	"nullable",
	"nullish",
	"readonly",
	"catch",
]);

type ZodNode = {
	def?: {
		type?: string;
		innerType?: ZodNode;
		shape?: Record<string, ZodNode>;
	};
};

function unwrap(node: ZodNode): ZodNode {
	let current = node;
	while (
		current.def &&
		WRAPPER_TYPES.has(current.def.type ?? "") &&
		current.def.innerType
	) {
		current = current.def.innerType;
	}
	return current;
}

function collect(node: ZodNode, prefix: string, out: string[]): void {
	const unwrapped = unwrap(node);
	const shape = unwrapped.def?.shape;
	if (unwrapped.def?.type === "object" && shape) {
		for (const [key, child] of Object.entries(shape)) {
			collect(child, prefix ? `${prefix}.${key}` : key, out);
		}
		return;
	}
	out.push(prefix);
}

export function enumerateConfigLeafKeys(schema: z.ZodTypeAny): string[] {
	const out: string[] = [];
	collect(schema as unknown as ZodNode, "", out);
	return out.sort();
}
