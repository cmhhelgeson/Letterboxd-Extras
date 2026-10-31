import { createElement } from './dom';

// The element-building parts of: letterboxd.helpers.ShowErrorMessage(message, id)
// ShowErrorMessage still finds or adds the panel, skips duplicate messages and places each one.

// Replaces the "Extras Error - Click to view" button built in ShowErrorMessage
export function ErrorMessageButton(): HTMLDivElement {
	// The main 'button'
	const button = createElement('div', {
		class: 'extras-error-button text-slug'
	});

	const label = createElement('span', {
		class: 'extras-error-label'
	});
	label.innerText = 'Extras Error - Click to view';
	button.append(label);

	const badge = createElement('div', {
		class: 'extras-error-badge'
	});
	badge.innerText = '!';
	button.append(badge);

	button.addEventListener('click', event => {
		// @ts-ignore toggleErrorMessage is a global, defined in common/additional.js
		toggleErrorMessage(event);
	});

	return button;
}

// Replaces the list of messages, ending in the "Go to settings" link, built in ShowErrorMessage
export function ErrorMessageList(): HTMLUListElement {
	// The ul element that will contain the error text
	const errorHolder = createElement('ul', {
		class: 'extras-error-holder'
	});

	// Create the settings link
	const li = createElement('li', {
		class: 'extras-error-settings-link'
	});
	const a = createElement('a', {});
	a.href = browser.runtime.getURL('/options.html');
	a.target = '_blank';
	a.innerText = 'Go to settings';
	li.append(a);

	errorHolder.append(li);

	return errorHolder;
}

export interface ErrorMessagePanelProps {
	button: HTMLElement
	list: HTMLElement
}

// Replaces the div.extras-error-div holding the button and the list, built in ShowErrorMessage
export function ErrorMessagePanel({ button, list }: ErrorMessagePanelProps): HTMLDivElement {
	const div = createElement('div', {
		class: 'extras-error-div'
	});
	div.append(button);
	div.append(list);

	return div;
}

export interface ErrorMessageItemProps {
	/** Identifies the message so it is only shown once, as in extras-error-${id}. */
	id: string
	message: string
}

// Replaces one error message built in ShowErrorMessage
export function ErrorMessageItem({ id, message }: ErrorMessageItemProps): HTMLLIElement {
	const li = createElement('li', {
		class: `extras-error-${id}`
	});
	const span = createElement('span', {});
	span.innerText = message;
	li.append(span);

	return li;
}
