import NextLink from "next/link";
import type { ComponentProps, Ref } from "react";

/**
 * next/link with viewport prefetching off. A dictionary page links to dozens of other entries;
 * fetching each one's payload as it scrolls into view would cost readers megabytes per page.
 * Navigation still happens client-side; the page is fetched on click.
 */
export default function Link({
  ref,
  ...props
}: ComponentProps<typeof NextLink> & { ref?: Ref<HTMLAnchorElement> }) {
  return <NextLink ref={ref} prefetch={false} {...props} />;
}
