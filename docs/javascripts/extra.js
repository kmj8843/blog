// mermaid zooming
if (globalThis.__mermaidZoomInitialized === undefined) {
	globalThis.__mermaidZoomInitialized = true;

	document.addEventListener("click", function (event) {
		const target = event.target;

		if (!(target instanceof Element)) {
			return;
		}

		const mermaidNode = target.closest("div.mermaid");

		if (!mermaidNode) {
			document
				.querySelectorAll("div.mermaid.is-zoomed")
				.forEach(function (node) {
					node.classList.remove("is-zoomed");
				});
			return;
		}

		const isZoomed = mermaidNode.classList.contains("is-zoomed");

		document.querySelectorAll("div.mermaid.is-zoomed").forEach(function (node) {
			node.classList.remove("is-zoomed");
		});

		if (!isZoomed) {
			mermaidNode.classList.add("is-zoomed");
		}
	});
}
