import {
	excerpt,
	extractLink,
	extractText,
	type FeedItem,
	matchAll,
	parseDate,
} from "./shared";

function parseRss(xml: string, feedOrigin: string): FeedItem[] {
	const feedTitle = extractText(xml, "title");
	return matchAll(xml, /<item[\s>]([\s\S]*?)<\/item>/g).map((itemXml) => ({
		title: extractText(itemXml, "title"),
		link: extractLink(itemXml),
		pubDate: parseDate(
			extractText(itemXml, "pubDate") || extractText(itemXml, "dc:date"),
		),
		feedTitle,
		feedOrigin,
		excerpt: excerpt(itemXml, "description", "content:encoded"),
	}));
}

function parseAtom(xml: string, feedOrigin: string): FeedItem[] {
	const feedTitle = extractText(xml, "title");
	return matchAll(xml, /<entry[\s>]([\s\S]*?)<\/entry>/g).map((entryXml) => ({
		title: extractText(entryXml, "title"),
		link: extractLink(entryXml),
		pubDate: parseDate(
			extractText(entryXml, "published") || extractText(entryXml, "updated"),
		),
		feedTitle,
		feedOrigin,
		excerpt: excerpt(entryXml, "summary", "content"),
	}));
}

export function parseFeed(xml: string, feedOrigin: string): FeedItem[] {
	if (xml.includes("<feed")) return parseAtom(xml, feedOrigin);
	return parseRss(xml, feedOrigin);
}
