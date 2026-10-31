import { createElement } from './dom';

export interface WatchLinkOptions {
	title: string
	link: string
	sourceID: string
}

export interface PurchaseOption {
	text: string
	link: string
}

export interface PurchaseSourceOptions {
	sourceName: string
	sourceID: string
}

// Replaces: Helper._createWatchLinkDisplay(options: WatchLinkOptions)
export function WatchLinkDisplay(options: WatchLinkOptions): HTMLAnchorElement {

	const watchLinkDisplay = createElement('a', {
		class: 'label track-event tooltip',
		'data-track-action': 'availability',
		target: '_blank',
		rel: 'nofollow noopener noreferrer',
		'data-original-title': `View on ${options.title}`,
		'data-track-params': `{"service": "${options.sourceID}"}`,
		href: options.link
	});
	watchLinkDisplay.setAttribute('data-track-action', 'availability');
	watchLinkDisplay.setAttribute('data-original-title', `View on ${options.title}`);
	watchLinkDisplay.setAttribute('data-track-params', `{"service": "${options.sourceID}"}`);

	const brandElement = createElement('span', {
		class: 'brand'
	});

	//brandElement.innerHTML += '<svg></svg>';

	const titleElement = createElement('span', {
		class: 'title'
	});
	const nameSpan = createElement('span', {
		class: 'name'
	});
	nameSpan.innerText = options.title;
	titleElement.append(nameSpan);

	watchLinkDisplay.append(brandElement);
	watchLinkDisplay.append(titleElement);

	return watchLinkDisplay;

}

export interface WatchLinkPurchaseButtonProps {
	/** The purchase action and where it leads (in most cases just the film's page). */
	purchaseOption: PurchaseOption
	sourceOptions: PurchaseSourceOptions
}

// Replaces: Helper._createWatchLinkPurchaseButton(purchaseOption: PurchaseOption, sourceOptions: PurchaseSourceOptions)
export function WatchLinkPurchaseButton({ purchaseOption, sourceOptions }: WatchLinkPurchaseButtonProps): HTMLAnchorElement {

	const purchaseButton = createElement('a', {
		class: `link -${purchaseOption.text.toLowerCase()} track-event`,
		'data-track-action': 'availability',
		'data-track-params': `{"service": "${sourceOptions.sourceID}"}`,
		href: purchaseOption.link,
		title: `${purchaseOption.text} from ${sourceOptions.sourceName}`,
		target: '_blank',
		rel: 'nofollow noopener noreferrer'
	});

	const textSpan = createElement('span', {
		class: 'extended'
	});
	textSpan.innerText = purchaseOption.text;

	purchaseButton.append(textSpan);

	return purchaseButton;

}

export interface WatchLinkPurchaseOptionsProps {
	purchaseOptions: PurchaseOption[]
	sourceOptions: PurchaseSourceOptions
}

// Replaces: Helper._createWatchLinkPurchaseOptions(purchaseOptions: PurchaseOption[], sourceOptions: PurchaseSourceOptions)
export function WatchLinkPurchaseOptions({ purchaseOptions, sourceOptions }: WatchLinkPurchaseOptionsProps): HTMLSpanElement {

	const purchaseOptionsSpan = createElement('span', {
		class: 'options js-film-availability-options'
	});

	for (const purchaseOption of purchaseOptions) {

		purchaseOptionsSpan.append(
			WatchLinkPurchaseButton({ purchaseOption, sourceOptions })
		);

	}

	return purchaseOptionsSpan;

}

// Replaces the services container built in: Helper._createWatchLink(options: WatchLinkOptions)
export function WatchServices(): HTMLDivElement {
	return createElement('div', {
		class: 'services'
	});
}

// Replaces the service row built in: Helper._createWatchLink(options: WatchLinkOptions)
// _createWatchLink still finds the watch section and adds the row to it.
export function WatchLink(options: WatchLinkOptions): HTMLParagraphElement {

	const serviceParagraph = createElement('p', {
		class: 'service extras-service',
		id: `source-${options.sourceID}`
	});


	serviceParagraph.append(WatchLinkDisplay(options));
	serviceParagraph.append(WatchLinkPurchaseOptions({
		purchaseOptions: [{ text: 'Buy', link: options.link }],
		sourceOptions: { sourceID: options.sourceID, sourceName: options.title }
	}));

	return serviceParagraph;

}
