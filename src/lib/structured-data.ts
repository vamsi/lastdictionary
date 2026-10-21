import type {
  BreadcrumbList,
  Dataset,
  DefinedTerm,
  DefinedTermSet,
  Graph,
  ItemList,
  Person,
  SearchAction,
  Thing,
  WebPage,
  WebSite,
} from "schema-dts";
import type { Dictionary } from "./dictionary";
import type { Entry } from "./schema";
import { entryModifiedMonth, metaDescription } from "./seo";
import { absoluteUrl, entryPath, TAGLINE } from "./site";

/**
 * Schema.org descriptions of the site, typed so a misspelt property fails the build.
 * Every page carries a graph: the WebSite and its editor, plus the page and its main entity.
 */

const LICENSE = "https://creativecommons.org/licenses/by/4.0/";

const ids = (dict: Dictionary) => ({
  site: `${dict.meta.url}#website`,
  set: `${dict.meta.url}#dictionary`,
  editor: `${dict.meta.url}#editor`,
  dataset: `${dict.meta.url}#dataset`,
});

export function editorNode(dict: Dictionary): Person {
  return {
    "@type": "Person",
    "@id": ids(dict).editor,
    name: dict.meta.editor,
    sameAs: ["https://github.com/vamsi"],
  };
}

export function websiteNode(dict: Dictionary): WebSite {
  const { meta } = dict;
  return {
    "@type": "WebSite",
    "@id": ids(dict).site,
    url: meta.url,
    name: meta.title,
    alternateName: TAGLINE,
    description: metaDescription(meta.description),
    inLanguage: "en",
    publisher: { "@id": ids(dict).editor },
    potentialAction: searchAction(dict),
  };
}

/** schema-dts omits SearchAction's `query-input`, which Google requires for a sitelinks search box. */
type SearchActionWithInput = SearchAction & { "query-input": string };

function searchAction(dict: Dictionary): SearchAction {
  const action: SearchActionWithInput = {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${dict.meta.url}?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  };
  return action;
}

export function termSetNode(dict: Dictionary): DefinedTermSet {
  const { meta } = dict;
  return {
    "@type": "DefinedTermSet",
    "@id": ids(dict).set,
    name: meta.title,
    alternateName: TAGLINE,
    url: meta.url,
    description: metaDescription(meta.description),
    inLanguage: "en",
    datePublished: meta.datePublished,
    editor: { "@id": ids(dict).editor },
    license: LICENSE,
    isAccessibleForFree: true,
  };
}

export function datasetNode(dict: Dictionary): Dataset {
  const { meta } = dict;
  return {
    "@type": "Dataset",
    "@id": ids(dict).dataset,
    name: `${meta.title}: all entries`,
    description:
      "Every entry of The Last Dictionary as structured data: headword, part of speech, other names, plain-words and precise definitions, origin, year of first use, cross-references and sources.",
    url: meta.url,
    inLanguage: "en",
    license: LICENSE,
    isAccessibleForFree: true,
    creator: { "@id": ids(dict).editor },
    version: meta.edition,
    dateModified: meta.datePublished,
    keywords: [
      "artificial intelligence",
      "machine learning",
      "AI glossary",
      "dictionary",
      "terminology",
    ],
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: absoluteUrl(dict, "/data/dictionary.json"),
      },
      {
        "@type": "DataDownload",
        encodingFormat: "text/csv",
        contentUrl: absoluteUrl(dict, "/data/dictionary.csv"),
      },
    ],
  };
}

export function definedTermNode(dict: Dictionary, entry: Entry): DefinedTerm {
  const url = absoluteUrl(dict, entryPath(entry.id));
  return {
    "@type": "DefinedTerm",
    "@id": `${url}#term`,
    name: entry.term,
    ...(entry.also?.length ? { alternateName: entry.also } : {}),
    description: entry.plain,
    termCode: entry.id,
    url,
    inDefinedTermSet: { "@id": ids(dict).set },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbs(dict: Dictionary, trail: Crumb[]): BreadcrumbList {
  const all: Crumb[] = [{ name: dict.meta.title, path: "/" }, ...trail];
  return {
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(dict, c.path),
    })),
  };
}

export function itemListNode(dict: Dictionary, entryIds: readonly string[]): ItemList {
  const items = entryIds.map((id) => dict.byId.get(id)).filter((e): e is Entry => !!e);
  return {
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.term,
      url: absoluteUrl(dict, entryPath(e.id)),
    })),
  };
}

export interface PageSpec {
  path: string;
  name: string;
  description: string;
  type?: "WebPage" | "CollectionPage" | "AboutPage";
  dateModified?: string;
  breadcrumb?: BreadcrumbList;
  mainEntity?: Thing;
}

export function webPageNode(dict: Dictionary, spec: PageSpec): WebPage {
  const url = absoluteUrl(dict, spec.path);
  return {
    "@type": spec.type ?? "WebPage",
    "@id": url,
    url,
    name: spec.name,
    description: metaDescription(spec.description),
    inLanguage: "en",
    isPartOf: { "@id": ids(dict).site },
    datePublished: dict.meta.datePublished,
    dateModified: spec.dateModified ?? dict.meta.datePublished,
    ...(spec.breadcrumb ? { breadcrumb: spec.breadcrumb } : {}),
    ...(spec.mainEntity ? { mainEntity: spec.mainEntity } : {}),
  };
}

/** The graph for one page: site and editor first, then whatever the page adds. */
export function pageGraph(dict: Dictionary, ...nodes: Thing[]): Graph {
  return {
    "@context": "https://schema.org",
    "@graph": [websiteNode(dict), editorNode(dict), ...nodes],
  };
}

/** The entry page's graph. */
export function entryGraph(
  dict: Dictionary,
  entry: Entry,
  domainName: string,
  domainPath: string,
): Graph {
  return pageGraph(
    dict,
    webPageNode(dict, {
      path: entryPath(entry.id),
      name: entry.term,
      description: entry.plain,
      dateModified: entryModifiedMonth(dict, entry),
      breadcrumb: breadcrumbs(dict, [
        { name: domainName, path: domainPath },
        { name: entry.term, path: entryPath(entry.id) },
      ]),
      mainEntity: definedTermNode(dict, entry),
    }),
  );
}
