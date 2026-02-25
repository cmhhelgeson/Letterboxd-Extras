const ulElement = document.querySelector('ul.ai-style-change-1');
const headerElement = document.querySelector('div#tabbed-content > header'); // Targeting the header inside tabbed-content

// Store the original border-bottom style of the header
const originalHeaderBorderBottom = headerElement ? window.getComputedStyle(headerElement).borderBottom : '';

// Function to check for overflow and apply/remove styles
const handleOverflow = () => {
	if (!ulElement || !headerElement) return; // Exit if elements are not found

	const hasOverflow = ulElement.scrollWidth > ulElement.clientWidth;

	if (hasOverflow) {
		// If there's overflow, remove the border under the header.
		headerElement.style.borderBottom = 'none';
	} else {
		// If no overflow, restore the original border.
		headerElement.style.borderBottom = originalHeaderBorderBottom;
	}
};

// Initial check
handleOverflow();

// Add a resize observer to check for overflow when the window resizes or content changes
const resizeObserver = new ResizeObserver(handleOverflow);
resizeObserver.observe(ulElement);

// Add a MutationObserver to detect changes in children that might cause overflow
const mutationObserver = new MutationObserver(handleOverflow);
mutationObserver.observe(ulElement, { childList: true, subtree: true });




<style>
  ul.ai-style-change-1::-webkit-scrollbar {
    width: 8px; /* width of the entire scrollbar */
    height: 8px; /* height of the entire scrollbar for horizontal scrolling */
  }

  ul.ai-style-change-1::-webkit-scrollbar-track {
    background: transparent; /* color of the tracking area */
  }

  ul.ai-style-change-1::-webkit-scrollbar-thumb {
    background-color: #888; /* color of the scroll thumb */
    border-radius: 20px; /* roundness of the scroll thumb */
    border: 2px solid transparent; /* creates padding around scroll thumb */
  }

	ul.ai-style-change-1 {
  overflow-x: auto;
  white-space: nowrap;
}
</style>