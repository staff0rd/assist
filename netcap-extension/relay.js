// Isolated-world content script: bridges the MAIN-world interceptor's
// window.postMessage events to the background service worker via runtime
// messaging. The background worker, not the page, posts to the receiver, so the
// page's CSP (connect-src) never applies.
window.addEventListener("message", (event) => {
	if (event.source !== window) return;
	const data = event.data;
	if (!data || data.source !== "assist-netcap" || !data.entry) return;
	try {
		chrome.runtime.sendMessage({ type: "netcap-entry", entry: data.entry });
	} catch {
		// ignore: extension context invalidated (e.g. after reload)
	}
});
