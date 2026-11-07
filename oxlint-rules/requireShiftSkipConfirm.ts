type AstNode = {
	type: string;
	name?: string;
	callee?: AstNode;
};

type RequireShiftSkipConfirmOptions = {
	allow: Record<string, string>;
};

type RuleContext = {
	filename: string;
	options: readonly Partial<RequireShiftSkipConfirmOptions>[];
	report: (diagnostic: { node: AstNode; messageId: string }) => void;
};

const dialogName = "ConfirmDialog";
const hookName = "useShiftSkipConfirm";

const isAllowed = (
	filename: string,
	allow: Record<string, string>,
): boolean => {
	const path = filename.replaceAll("\\", "/");
	return Object.keys(allow).some(
		(suffix) => path === suffix || path.endsWith(`/${suffix}`),
	);
};

export const requireShiftSkipConfirm = {
	meta: {
		type: "problem",
		docs: {
			description: `Require a component rendering ${dialogName} to call ${hookName} so Shift-click skips the confirm.`,
		},
		messages: {
			missingHook: `${dialogName} rendered without ${hookName} — open it through the hook so Shift-click skips the confirm, or list this file in the rule's "allow" option with the reason it is exempt.`,
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
		const dialogs: AstNode[] = [];
		let usesHook = false;

		return {
			JSXOpeningElement(node: { type: string; name: AstNode }) {
				if (node.name.type === "JSXIdentifier" && node.name.name === dialogName)
					dialogs.push(node);
			},
			CallExpression(node: AstNode) {
				if (node.callee?.type === "Identifier" && node.callee.name === hookName)
					usesHook = true;
			},
			"Program:exit"() {
				if (usesHook) return;
				for (const node of dialogs)
					context.report({ node, messageId: "missingHook" });
			},
		};
	},
};

export default {
	meta: { name: "confirm" },
	rules: { "require-shift-skip-confirm": requireShiftSkipConfirm },
};
