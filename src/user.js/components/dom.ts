/* eslint-disable @typescript-eslint/no-explicit-any */
// The DOM primitives every component builds with. Shared by the components and letterboxd.helpers.

/** Attribute values are stringified by setAttribute, so numbers and booleans are accepted as-is. */
export type Attributes = Record<string, any>;

/** Inline style properties, assigned one by one to element.style. */
export type Styles = Record<string, any>;

// Replaces: letterboxd.helpers.createElement(tag, attrs, styles)
export function createElement<K extends keyof HTMLElementTagNameMap>(tag: K, attrs?: Attributes, styles?: Styles): HTMLElementTagNameMap[K] {
	const element = document.createElement(tag);
	for (const aKey in attrs) {
		if (!Object.prototype.hasOwnProperty.call(attrs, aKey)) continue;
		element.setAttribute(aKey, attrs[aKey]);
	}
	for (const sKey in styles) {
		if (!Object.prototype.hasOwnProperty.call(styles, sKey)) continue;
		(element.style as any)[sKey] = styles[sKey];
	}
	return element;
}

// Replaces: letterboxd.helpers.createElementNS(tag, namespace, attrs, styles)
export function createElementNS(tag: string, namespace: string, attrs?: Attributes, styles?: Styles): SVGElement {
	const element = document.createElementNS(namespace, tag) as SVGElement;
	for (const aKey in attrs) {
		if (!Object.prototype.hasOwnProperty.call(attrs, aKey)) continue;
		element.setAttribute(aKey, attrs[aKey]);
	}
	for (const sKey in styles) {
		if (!Object.prototype.hasOwnProperty.call(styles, sKey)) continue;
		(element.style as any)[sKey] = styles[sKey];
	}
	return element;
}
