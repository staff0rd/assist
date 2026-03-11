import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { fetchItems } from "./api";
import { type DateGroup, groupByDate } from "./groupByDate";
import { NewsItem } from "./NewsItem";

export function App() {
	const [groups, setGroups] = useState<DateGroup[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchItems()
			.then((items) => setGroups(groupByDate(items)))
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return <p className="text-gray-500 text-center py-12">Loading feeds…</p>;
	}

	if (groups.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500">No news items.</p>
				<p className="text-gray-600 text-sm mt-2">
					Add feeds with{" "}
					<code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs">
						assist news add
					</code>
				</p>
			</div>
		);
	}

	return (
		<div>
			{groups.map((group) => (
				<section key={group.label} className="mb-8">
					<h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 px-1">
						{group.label}
					</h2>
					<div className="space-y-2">
						{group.items.map((item) => (
							<NewsItem key={`${item.link}-${item.pubDate}`} item={item} />
						))}
					</div>
				</section>
			))}
		</div>
	);
}

const root = document.getElementById("app");
if (root) {
	createRoot(root).render(<App />);
}
