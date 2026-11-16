type AstNode = {
	type: string;
	name?: string;
	value?: unknown;
	callee?: AstNode;
	property?: AstNode;
	arguments?: AstNode[];
	expressions?: AstNode[];
	quasis?: { value: { cooked: string | null; raw: string } }[];
};

type PreferExecFileSyncOptions = {
	allow: Record<string, string>;
};

type RuleContext = {
	filename: string;
	options: readonly Partial<PreferExecFileSyncOptions>[];
	report: (diagnostic: {
		node: AstNode;
		messageId: string;
		data?: Record<string, string>;
	}) => void;
};

const shellOperator = /\||&&/;
const quote = /["'`]/;

const isAllowed = (
	filename: string,
	allow: Record<string, string>,
): boolean => {
	const path = filename.replaceAll("\\", "/");
	return Object.keys(allow).some(
		(suffix) => path === suffix || path.endsWith(`/${suffix}`),
	);
};

const isExecSync = (callee: AstNode | undefined): boolean =>
	(callee?.type === "Identifier" && callee.name === "execSync") ||
	(callee?.type === "MemberExpression" &&
		callee.property?.type === "Identifier" &&
		callee.property.name === "execSync");

const commandProblem = (command: AstNode | undefined): string | undefined => {
	if (command?.type === "Literal" && typeof command.value === "string") {
		if (shellOperator.test(command.value)) return undefined;
		return quote.test(command.value) ? "quoted" : undefined;
	}
	if (command?.type !== "TemplateLiteral") return undefined;
	const text = (command.quasis ?? [])
		.map((quasi) => quasi.value.cooked ?? quasi.value.raw)
		.join("");
	if (shellOperator.test(text)) return undefined;
	if ((command.expressions ?? []).length > 0) return "interpolated";
	return quote.test(text) ? "quoted" : undefined;
};

export const preferExecFileSync = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Require execFileSync with an args array instead of execSync for quoted or interpolated commands, which cmd.exe mangles on Windows.",
		},
		messages: {
			interpolated:
				"execSync with an interpolated command — on Windows cmd.exe treats quotes literally and expands %VAR%, so use execFileSync(file, [args]) instead.",
			quoted:
				"execSync with a quoted command — on Windows cmd.exe treats single quotes literally and expands %VAR%, so use execFileSync(file, [args]) instead.",
		},
		schema: [
			{
				type: "object",
				properties: {
					allow: { type: "object", additionalProperties: { type: "string" } },
				},
				additionalProperties: false,
			},
		],
	},
	create(context: RuleContext) {
		if (isAllowed(context.filename, context.options[0]?.allow ?? {})) return {};
		return {
			CallExpression(node: AstNode) {
				if (!isExecSync(node.callee)) return;
				const command = node.arguments?.[0];
				const messageId = commandProblem(command);
				if (messageId && command) context.report({ node: command, messageId });
			},
		};
	},
};

export default {
	meta: { name: "child-process" },
	rules: { "prefer-exec-file-sync": preferExecFileSync },
};
