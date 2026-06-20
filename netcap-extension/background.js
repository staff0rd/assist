// Background service worker: the only context that talks to the receiver. It
// runs outside any page, so the page's CSP does not restrict its fetches. On
// startup it pings the receiver (the connectivity spike) and thereafter
// forwards every captured entry relayed from the content scripts.
const RECEIVER = "http://127.0.0.1:8723/";

function ping() {
	fetch(`${RECEIVER}ping`, { method: "GET" }).catch(() => {});
}

ping();
chrome.runtime.onInstalled?.addListener(ping);
chrome.runtime.onStartup?.addListener(ping);

chrome.runtime.onMessage.addListener((message) => {
	if (!message || message.type !== "netcap-entry") return;
	fetch(RECEIVER, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(message.entry),
	}).catch(() => {});
});
