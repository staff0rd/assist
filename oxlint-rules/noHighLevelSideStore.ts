type AstNode = {
	type: string;
	name?: string;
	value?: unknown;
	source?: AstNode;
	quasis?: { value: { cooked: string | null; raw: string } }[];
};

type NoHighLevelSideStoreOptions = {
	paneDirs: string[];
	storeDirs: string[];
};

type RuleContext = {
	filename: string;
	options: readonly Partial<NoHighLevelSideStoreOptions>[];
	report: (diagnostic: {
		node: AstNode;
		messageId: string;
		data?: Record<string, string>;
	}) => void;
};

const browserStores = new Set([
	"localStorage",
	"sessionStorage",
	"indexedDB",
	"loadPersisted",
	"savePersisted",
	"clearPersisted",
	"prunePersisted",
]);

const storeMarkers = ["high-level-progress", ".draft.json"];

const storeInternals = ["highLevelProgressPath", "toStoredHighLevelProgress"];

const normalise = (filename: string): string => filename.replaceAll("\\", "/");

const inDir = (path: string, dirs: string[]): boolean =>
	dirs.some((dir) => {
		const trimmed = dir.replace(/\/+$/, "");
		return path.includes(`/${trimmed}/`) || path.endsWith(`/${trimmed}.tsx`);
	});

const literalText = (node: AstNode): string | undefined => {
	if (node.type === "Literal" && typeof node.value === "string")
		return node.value;
	if (node.type === "TemplateLiteral")
		return (node.quasis ?? [])
			.map((quasi) => quasi.value.cooked ?? quasi.value.raw)
			.join("");
	return undefined;
};

export const noHighLevelSideStore = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Keep high-level review progress in its one per-PR store: no browser storage in the pane, and no progress paths outside the store module.",
		},
		messages: {
			paneBrowserStore:
				"`{{name}}` in the high-level review pane — progress lives only in the per-PR store (POST/GET the high-level progress API); a browser-side copy is lost on another client or a new request.",
			progressOutsideStore:
				'"{{text}}" outside the high-level progress store module — read and write progress through saveHighLevelProgress / loadHighLevelProgress instead of a second store.',
			storeInternalImport:
				"`{{name}}` is internal to the high-level progress store — call saveHighLevelProgress / loadHighLevelProgress / clearHighLevelProgress instead.",
		},
		schema: [
			{
				type: "object",
				properties: {
					paneDirs: { type: "array", items: { type: "string" } },
					storeDirs: { type: "array", items: { type: "string" } },
				},
				additionalProperties: false,
			},
		],
	},
	create(context: RuleContext) {
		const options = context.options[0] ?? {};
		const path = normalise(context.filename);
		const inPane = inDir(path, options.paneDirs ?? []);
		const inStore = inDir(path, options.storeDirs ?? []);

		const checkLiteral = (node: AstNode) => {
			if (inStore) return;
			const text = literalText(node);
			const marker = storeMarkers.find((m) => text?.includes(m));
			if (marker)
				context.report({
					node,
					messageId: "progressOutsideStore",
					data: { text: marker },
				});
		};

		return {
			Identifier(node: AstNode) {
				if (!inPane || !browserStores.has(node.name ?? "")) return;
				context.report({
					node,
					messageId: "paneBrowserStore",
					data: { name: node.name ?? "" },
				});
			},
			Literal: checkLiteral,
			TemplateLiteral: checkLiteral,
			ImportDeclaration(node: AstNode) {
				if (inStore) return;
				const source = node.source?.value;
				if (typeof source !== "string") return;
				const internal = storeInternals.find((name) =>
					source.endsWith(`/${name}`),
				);
				if (internal)
					context.report({
						node,
						messageId: "storeInternalImport",
						data: { name: internal },
					});
			},
		};
	},
};

export default {
	meta: { name: "high-level-review" },
	rules: { "no-side-store": noHighLevelSideStore },
};
