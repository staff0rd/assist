import type { MouseEvent } from "react";
import { feedColor } from "./feedColor";
import { timeAgo } from "./timeAgo";
import type { FeedItem } from "./types";

function handleClick(e: MouseEvent<HTMLAnchorElement>) {
	const selection = window.getSelection();
	if (selection && selection.toString().length > 0) {
		e.preventDefault();
	}
}

export function NewsItem({ item }: { item: FeedItem }) {
	const faviconUrl = `${item.feedOrigin}/favicon.ico`;

	return (
		<a
			href={item.link}
			target="_blank"
			rel="noopener noreferrer"
			onClick={handleClick}
			draggable={false}
			className="block bg-gray-900 rounded-lg p-5 hover:bg-gray-800 transition-colors [user-select:text]"
		>
			<div className="flex items-center gap-2 mb-1.5">
				<img
					src={faviconUrl}
					alt=""
					className="w-4 h-4 rounded-sm"
					onError={(e) => {
						(e.target as HTMLImageElement).style.display = "none";
					}}
				/>
				<span
					className={`text-xs font-medium px-2 py-0.5 rounded-full ${feedColor(item.feedTitle)}`}
				>
					{item.feedTitle}
				</span>
				<span className="text-sm text-gray-500">{timeAgo(item.pubDate)}</span>
			</div>
			<h3 className="text-lg font-medium text-gray-100 leading-snug">
				{item.title}
			</h3>
			{item.excerpt && (
				<p className="text-base text-gray-400 mt-1.5 leading-relaxed">
					{item.excerpt}
				</p>
			)}
		</a>
	);
}
