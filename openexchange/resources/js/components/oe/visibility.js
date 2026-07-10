/**
 * Decorative animation must not burn CPU while it's scrolled off screen.
 *
 * Calls `onChange(true|false)` as `el` enters/leaves the viewport (with a margin, so
 * it's already running by the time you can see it). SSR-safe and degrades to
 * "always visible" where IntersectionObserver is missing. Returns a disconnect fn.
 */
export function observeVisibility(el, onChange, rootMargin = '120px') {
    if (typeof IntersectionObserver === 'undefined' || !el) {
        onChange(true);

        return () => {};
    }

    const io = new IntersectionObserver(
        ([entry]) => onChange(entry.isIntersecting),
        { rootMargin },
    );
    io.observe(el);

    return () => io.disconnect();
}
