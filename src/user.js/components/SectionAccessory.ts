/* eslint-disable @typescript-eslint/no-explicit-any */
import { createElement } from './dom';

// The element-building parts of: letterboxd.helpers.createSectionAccessory(section, text, href, style)
// createSectionAccessory still finds or adds the accessories holder and prepends the accessory.

// Replaces the div.section-accessories holder built in createSectionAccessory
export function SectionAccessories(): HTMLDivElement {
	return createElement('div', {
		class: 'section-accessories'
	});
}

export interface SectionAccessoryAsideProps {
	/** The holder from SectionAccessories, placed inside the aside. */
	accessories: HTMLElement
}

// Replaces the <aside> wrapping the holder built in createSectionAccessory
export function SectionAccessoryAside({ accessories }: SectionAccessoryAsideProps): HTMLElement {
	const aside = createElement('aside', {
		class: 'aside'
	});
	aside.append(accessories);

	return aside;
}

export interface SectionAccessoryProps {
	text: string
	href: string
	/** A CSS style string. */
	style?: string | null
}

// Replaces the accessory link built in createSectionAccessory
export function SectionAccessory({ text, href, style }: SectionAccessoryProps): HTMLAnchorElement {
	const accessory = createElement('a', {
		class: 'accessory'
	});

	if (text != '')
		accessory.innerText = text;

	if (href != '')
		accessory.href = href;

	if (style)
		(accessory as any).style = style

	return accessory;
}
