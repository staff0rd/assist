type AstNode = {
	type: string;
	name?: string;
	value?: unknown;
	operator?: string;
	left?: AstNode;
	right?: AstNode;
	test?: AstNode | null;
	property?: AstNode;
	discriminant?: AstNode;
	cases?: AstNode[];
};

type NoHarnessBranchesOptions = {
	harnesses: string[];
	adapterDirs: string[];
	allow: Record<string, string>;
};

type RuleContext = {
	filename: string;
	options: readonly Partial<NoHarnessBranchesOptions>[];
	report: (diagnostic: {
		node: AstNode;
		messageId: string;
		data?: Record<string, string>;
	}) => void;
};

const defaultHarnesses = ["claude", "codex", "pi"];
const sessionTypeField = "commandType";

const normalise = (filename: string): string => filename.replaceAll("\\", "/");

const matchesSuffix = (path: string, suffix: string): boolean =>
	path === suffix || path.endsWith(`/${suffix}`);

const inAdapterDir = (path: string, dirs: string[]): boolean =>
	dirs.some((dir) => path.includes(`/${dir.replace(/\/+$/, "")}/`));

const harnessLiteral = (
	node: AstNode | null | undefined,
	harnesses: string[],
): string | undefined =>
	node?.type === "Literal" &&
	typeof node.value === "string" &&
	harnesses.includes(node.value)
		? node.value
		: undefined;

const isSessionType = (node: AstNode | undefined): boolean =>
	(node?.type === "Identifier" && node.name === sessionTypeField) ||
	(node?.type === "MemberExpression" &&
		node.property?.type === "Identifier" &&
		node.property.name === sessionTypeField);

export const noHarnessBranches = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Forbid branching on a concrete harness name outside the harness adapters.",
		},
		messages: {
			harnessBranch:
				'Branch on harness "{{harness}}" outside src/shared/harnessAdapters/ — declare a capability on the adapters and resolve it (resolveFeature / harnessCapability), or move this into the adapter. Pre-existing branches are listed in the rule\'s "allow" option with the phase that removes them.',
		},
		schema: [
			{
				type: "object",
				properties: {
					harnesses: { type: "array", items: { type: "string" } },
					adapterDirs: { type: "array", items: { type: "string" } },
					allow: { type: "object", additionalProperties: { type: "string" } },
				},
				additionalProperties: false,
			},
		],
	},
	create(context: RuleContext) {
		const options = context.options[0] ?? {};
		const path = normalise(context.filename);
		if (inAdapterDir(path, options.adapterDirs ?? [])) return {};
		if (Object.keys(options.allow ?? {}).some((s) => matchesSuffix(path, s)))
			return {};
		const harnesses = options.harnesses ?? defaultHarnesses;
		const report = (node: AstNode, harness: string) =>
			context.report({ node, messageId: "harnessBranch", data: { harness } });

		return {
			BinaryExpression(node: AstNode) {
				if (!["===", "!==", "==", "!="].includes(node.operator ?? "")) return;
				const left = harnessLiteral(node.left, harnesses);
				const right = harnessLiteral(node.right, harnesses);
				const harness = left ?? right;
				if (!harness) return;
				const other = left ? node.right : node.left;
				if (isSessionType(other)) return;
				report(node, harness);
			},
			SwitchStatement(node: AstNode) {
				if (isSessionType(node.discriminant)) return;
				for (const switchCase of node.cases ?? []) {
					const harness = harnessLiteral(switchCase.test, harnesses);
					if (harness) report(switchCase, harness);
				}
			},
		};
	},
};

export default {
	meta: { name: "harness" },
	rules: { "no-harness-branches": noHarnessBranches },
};
