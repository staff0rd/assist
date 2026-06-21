import { asObject, type Mention } from "./buildMentionMap";

type Json = Record<string, unknown>;

const profileUrl = (slug: string): string =>
	`https://www.linkedin.com/in/${slug}/`;

function profileSlug(actor: Json | undefined): string | undefined {
	const target = asObject(actor?.navigationContext)?.actionTarget;
	if (typeof target !== "string") return undefined;
	return target.match(/\/in\/([^/?]+)/)?.[1];
}

/** Resolve a voyager update's author from its actor's profile link and name. */
export function resolveVoyagerAuthor(update: Json): Mention | undefined {
	const actor = asObject(update.actor);
	const slug = profileSlug(actor);
	if (!slug) return undefined;
	const name = asObject(actor?.name)?.text;
	const mention: Mention = { slug, url: profileUrl(slug) };
	if (typeof name === "string" && name.trim()) mention.name = name.trim();
	return mention;
}
