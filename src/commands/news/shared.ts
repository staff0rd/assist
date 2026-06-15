export function extractText(xml: string, tag: string): string {
	const cdataMatch = xml.match(
		new RegExp(`<${tag}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`),
	);
	if (cdataMatch) return cdataMatch[1].trim();
	const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
	return match ? match[1].trim() : "";
}

export function extractLink(itemXml: string): string {
	const atomLink = itemXml.match(
		/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/,
	);
	if (atomLink) return atomLink[1];
	const atomLink2 = itemXml.match(/<link[^>]*href=["']([^"']+)["']/);
	if (atomLink2) return atomLink2[1];
	return extractText(itemXml, "link");
}

export function parseDate(dateStr: string): string {
	if (!dateStr) return new Date(0).toISOString();
	try {
		return new Date(dateStr).toISOString();
	} catch {
		return new Date(0).toISOString();
	}
}

import { decodeHTML } from "entities";

function stripHtml(html: string): string {
	const decoded = decodeHTML(html);
	const stripped = decoded
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	return decodeHTML(stripped);
}

export function matchAll(xml: string, regex: RegExp): string[] {
	const results: string[] = [];
	for (const m of xml.matchAll(regex)) {
		results.push(m[1]);
	}
	return results;
}

const MAX_EXCERPT = 500;

export function excerpt(xml: string, ...tags: string[]): string {
	for (const tag of tags) {
		const raw = extractText(xml, tag);
		if (!raw) continue;
		const text = stripHtml(raw);
		if (text.length <= MAX_EXCERPT) return text;
		return `${text.slice(0, MAX_EXCERPT)}…`;
	}
	return "";
}

export type FeedItem = {
	title: string;
	link: string;
	pubDate: string;
	feedTitle: string;
	feedOrigin: string;
	excerpt: string;
};
