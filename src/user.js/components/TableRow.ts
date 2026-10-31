import { createElement } from './dom';

export interface TableRowValueProps {
	value: string | null
}

// Replaces the value divs built in: letterboxd.helpers.createTableRow(table, label, value1, value2, value3)
// createTableRow still inserts the row and its cells into the table.
export function TableRowValue({ value }: TableRowValueProps): HTMLDivElement {
	const div = createElement("div", { class: 'extras-table-value' })
	div.innerText = value as string;

	return div;
}
