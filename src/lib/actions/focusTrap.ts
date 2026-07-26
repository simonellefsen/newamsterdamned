/**
 * Svelte action: trap Tab focus inside a modal and restore focus on destroy.
 * Also focuses the first focusable control (or the container) on mount.
 */

const FOCUSABLE =
	'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function listFocusable(root: HTMLElement): HTMLElement[] {
	return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
		(el) => !el.hasAttribute('disabled') && el.offsetParent !== null
	);
}

export function focusTrap(node: HTMLElement) {
	const previouslyFocused =
		typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
			? document.activeElement
			: null;

	function focusInitial() {
		const items = listFocusable(node);
		const target = items[0] ?? node;
		if (!target.hasAttribute('tabindex') && target === node) {
			node.tabIndex = -1;
		}
		target.focus({ preventScroll: true });
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key !== 'Tab') return;
		const items = listFocusable(node);
		if (items.length === 0) {
			e.preventDefault();
			node.focus({ preventScroll: true });
			return;
		}
		const first = items[0];
		const last = items[items.length - 1];
		const active = document.activeElement as HTMLElement | null;

		if (e.shiftKey) {
			if (active === first || !node.contains(active)) {
				e.preventDefault();
				last.focus();
			}
		} else if (active === last || !node.contains(active)) {
			e.preventDefault();
			first.focus();
		}
	}

	// Defer so Svelte finishes mounting children before we focus.
	const t = window.setTimeout(focusInitial, 0);
	node.addEventListener('keydown', onKeydown);

	return {
		destroy() {
			clearTimeout(t);
			node.removeEventListener('keydown', onKeydown);
			if (previouslyFocused && document.contains(previouslyFocused)) {
				previouslyFocused.focus({ preventScroll: true });
			}
		}
	};
}
