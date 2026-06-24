// MAIN-world content script: runs in the page's own JS context so it can patch
// the page's fetch/XMLHttpRequest before page code uses them. Captured entries
// are handed to the isolated-world relay via window.postMessage; this script
// never talks to the receiver itself (the background worker does, outside CSP).
(() => {
	const SOURCE = "assist-netcap";

	function post(entry) {
		try {
			window.postMessage({ source: SOURCE, entry }, "*");
		} catch {
			// ignore: structured-clone failures on exotic bodies
		}
	}

	function bodyToString(body) {
		return typeof body === "string" ? body : null;
	}

	const originalFetch = window.fetch;
	if (typeof originalFetch === "function") {
		window.fetch = function (...args) {
			const input = args[0];
			const init = args[1] || {};
			const url =
				typeof input === "string" || input instanceof URL
					? String(input)
					: input && input.url
						? input.url
						: "";
			const method = (
				init.method ||
				(input && input.method) ||
				"GET"
			).toUpperCase();
			const requestBody = bodyToString(init.body);
			const result = originalFetch.apply(this, args);
			result
				.then((response) => {
					response
						.clone()
						.text()
						.then((responseBody) => {
							post({
								url,
								method,
								status: response.status,
								requestBody,
								responseBody,
								timestamp: Date.now(),
							});
						})
						.catch(() => {});
				})
				.catch(() => {});
			return result;
		};
	}

	// why: voyager GraphQL uses responseType "json"/"blob" (no responseText), so reading responseText alone captured them empty
	function xhrResponseBody(xhr) {
		try {
			const type = xhr.responseType;
			if (type === "" || type === "text") return xhr.responseText ?? "";
			if (type === "json")
				return xhr.response == null ? "" : JSON.stringify(xhr.response);
			if (type === "arraybuffer") return new TextDecoder().decode(xhr.response);
			if (type === "document")
				return xhr.response?.documentElement?.outerHTML ?? "";
			if (type === "blob") return xhr.response;
		} catch {
			// ignore: response unavailable for this responseType
		}
		return "";
	}

	const OriginalXHR = window.XMLHttpRequest;
	if (OriginalXHR) {
		const open = OriginalXHR.prototype.open;
		const send = OriginalXHR.prototype.send;
		OriginalXHR.prototype.open = function (method, url, ...rest) {
			this.__netcap = {
				method: String(method).toUpperCase(),
				url: String(url),
			};
			return open.call(this, method, url, ...rest);
		};
		OriginalXHR.prototype.send = function (body) {
			const meta = this.__netcap;
			if (meta) {
				meta.requestBody = bodyToString(body);
				this.addEventListener("loadend", () => {
					const emit = (responseBody) =>
						post({
							url: meta.url,
							method: meta.method,
							status: this.status,
							requestBody: meta.requestBody ?? null,
							responseBody,
							timestamp: Date.now(),
						});
					const value = xhrResponseBody(this);
					if (value instanceof Blob) {
						value
							.text()
							.then(emit)
							.catch(() => emit(""));
					} else {
						emit(value);
					}
				});
			}
			return send.call(this, body);
		};
	}
})();
