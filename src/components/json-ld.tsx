import type { Graph, Thing, WithContext } from "schema-dts";

/** Structured data for search and answer engines. The payload is our own JSON, never user HTML. */
export function JsonLd({ data }: { data: Graph | WithContext<Thing> }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: serialized JSON we generate ourselves
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
