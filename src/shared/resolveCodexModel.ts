const CODEX_DEFAULT_MODEL = "codex-default";

export function resolveCodexModel(raw: string | undefined): string | undefined {
	const model = raw?.trim();
	if (!model || model === CODEX_DEFAULT_MODEL) return undefined;
	return model;
}
