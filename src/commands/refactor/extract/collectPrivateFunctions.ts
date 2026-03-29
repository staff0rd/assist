import { type FunctionDeclaration, SyntaxKind } from "ts-morph";

function isPrivate(fn: FunctionDeclaration): boolean {
	return !fn.isExported() && !fn.isDefaultExport();
}

function getCalledFunctionNames(fn: FunctionDeclaration): Set<string> {
	const names = new Set<string>();
	for (const call of fn.getDescendantsOfKind(SyntaxKind.CallExpression)) {
		const expr = call.getExpression();
		if (expr.getKind() === SyntaxKind.Identifier) {
			names.add(expr.getText());
		}
	}
	return names;
}

export function collectPrivateFunctions(
	target: FunctionDeclaration,
	fnMap: Map<string, FunctionDeclaration>,
): FunctionDeclaration[] {
	const collected = new Set<string>();
	const queue: FunctionDeclaration[] = [target];

	let current = queue.pop();
	while (current) {
		for (const name of getCalledFunctionNames(current)) {
			if (collected.has(name)) continue;
			const fn = fnMap.get(name);
			if (fn && isPrivate(fn)) {
				collected.add(name);
				queue.push(fn);
			}
		}
		current = queue.pop();
	}

	return [...collected].flatMap((name) => {
		const fn = fnMap.get(name);
		return fn ? [fn] : [];
	});
}
