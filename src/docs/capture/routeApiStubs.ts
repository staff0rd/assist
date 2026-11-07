import type { BrowserContext } from "playwright";

export async function routeApiStubs(
	context: BrowserContext,
	apiStubs: ReadonlyMap<string, unknown>,
): Promise<void> {
	for (const [path, json] of apiStubs)
		await context.route(
			(url) => url.pathname === path,
			(route) => route.fulfill({ json }),
		);
}
