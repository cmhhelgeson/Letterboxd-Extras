import { SourceIdentifier, StorageObject } from '../types/types';
import { createElement } from './dom';
import { ShowDetailsButton } from './ShowDetailsButton';

// Most class names are built from a helper's selectorPrefix. A few sources predate that convention,
// and their CSS still expects an older name; these maps give that name, per element, keyed by
// selectorPrefix. A prefix that is not listed uses itself.

/** Class name stem for the logo link, as in `logo-${name}`. */
const logoClassNames: Partial<Record<SourceIdentifier, string>> = {
	tomato: 'tomatoes'
};

/**
 * Name of the SHOW DETAILS button, as in `${name}-show-details`, and of the details it toggles,
 * `${name}-score-details`. toggleDetails (common/additional.js) also stores the shown/hidden choice
 * under `${name}-score-details`, so changing a name here forgets users' saved preference.
 */
const showDetailsNames: Partial<Record<SourceIdentifier, string>> = {
	tomato: 'rt'
};

export interface LogoProps {
	href: string
	style?: string
	innerHTML?: string
	svg?: HTMLElement | SVGElement
}

export interface ChartSectionElementProps {
	selectorPrefix: SourceIdentifier
	/** Adds the extras-chart class, for sections holding a histogram chart. */
	isChart?: boolean
}

// Replaces: Helper._createChartSectionElement(isChart: boolean)
//      and: letterboxd.helpers.createChartSectionElement(sectionID)
export function ChartSectionElement({ selectorPrefix, isChart = false }: ChartSectionElementProps): HTMLElement {

	if (isChart) {

		return createElement('section', {
			class: `extras-section ratings-histogram-chart ${selectorPrefix}-ratings ratings-extras extras-chart`
		});

	} else {

		return createElement('section', {
			class: `extras-section ratings-histogram-chart ${selectorPrefix}-ratings ratings-extras`
		});

	}

}

export interface ChartSectionHeaderProps {
	/** CSS style string to apply to the heading. */
	headerStyle?: string
}

// Replaces: Helper._createChartSectionHeader(headerStyle?: string)
//      and: letterboxd.helpers.createChartSectionHeader(headerStyle)
export function ChartSectionHeader({ headerStyle }: ChartSectionHeaderProps = {}): HTMLHeadingElement {

	const headerProps = {
		class: 'section-heading section-heading-extras',
		...(headerStyle ? { style: headerStyle } : {})
	};

	const heading = createElement('h2', headerProps);
	return heading;

}

export interface ChartSectionLogoHolderProps {
	selectorPrefix: SourceIdentifier
	logoProps: LogoProps
}

// Replaces: Helper._createChartSectionLogoHolder(logoProps: LogoProps)
//      and: letterboxd.helpers.createChartSectionLogoHolder(sectionID, logoProps)
export function ChartSectionLogoHolder({ selectorPrefix, logoProps }: ChartSectionLogoHolderProps): HTMLAnchorElement {

	const logoHolder = createElement('a', {
		class: `logo-${logoClassNames[selectorPrefix] ?? selectorPrefix}`,
		href: logoProps.href,
		style: logoProps.style
	});

	if (logoProps.svg){
		logoHolder.append(logoProps.svg);
	}

	return logoHolder;

}

export interface SectionShowDetailsButtonProps {
	selectorPrefix: SourceIdentifier
	storage: StorageObject
	isMobile: boolean | null
}

// Replaces: Helper._createShowDetailsButton() — the SHOW DETAILS button for a source's sidebar section,
// named from its selectorPrefix
export function SectionShowDetailsButton({ selectorPrefix, storage, isMobile }: SectionShowDetailsButtonProps): HTMLAnchorElement {

	const name = showDetailsNames[selectorPrefix] ?? selectorPrefix;

	return ShowDetailsButton({ name, target: `${name}-score-details`, storage, isMobile });

}

export interface ChartSectionProps {
	selectorPrefix: SourceIdentifier
	logoProps: LogoProps
	/** CSS style string to apply to the heading. */
	headerStyle?: string
	isMobile: boolean | null
	storage: StorageObject
}

// Replaces: Helper._createChartSection(logoProps: LogoProps, headerStyle?: string)
//      and: letterboxd.helpers.createChartSection(sectionID, logoProps, headerStyle)
export function ChartSection({ selectorPrefix, logoProps, headerStyle, isMobile, storage }: ChartSectionProps): HTMLElement {

	const chartSection = ChartSectionElement({ selectorPrefix, isChart: false });
	const heading = ChartSectionHeader({ headerStyle });
	chartSection.append(heading);

	const logoHolder = ChartSectionLogoHolder({ selectorPrefix, logoProps });
	heading.append(logoHolder);

	if (isMobile) {
		// Add the Show Details button
		const showDetails = SectionShowDetailsButton({ selectorPrefix, storage, isMobile });
		chartSection.append(showDetails);
	}

	return chartSection;

}
