import { ghErrorText } from "./ghErrorText";

export function projectErrorText(error: unknown): string {
	const text = ghErrorText(error);
	if (/read:project|required scopes/i.test(text))
		return "The gh token has no project scope, so the project cannot be read. Run: gh auth refresh -h github.com -s project";
	return text;
}
