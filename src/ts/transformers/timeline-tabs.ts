import { WaterfallEntryTab, TabRenderer, SafeKvTuple } from "../typing/waterfall";
import { getKeys } from "./extract-timeline-keys";
import { escapeHtml } from "../helpers/parse";
import { makeDefinitionList } from "./helpers";

/**
 * Generates the tabs for the details-overlay of a `Entry`
 * @param  {Entry} entry - the entry to parse
 * @param  {number} requestID
 * @param  {RequestType} requestType
 * @param  {number} startRelative - start time in ms, relative to the page's start time
 * @param  {number} endRelative - end time in ms, relative to the page's start time
 * @param  {number} detailsHeight - height of the details-overlay
 * @param  {WaterfallEntryIndicator[]} indicators
 * @returns WaterfallEntryTab
 */
export function makeTabs(entry: PerformanceResourceTiming): WaterfallEntryTab[] {
  const tabs = [] as WaterfallEntryTab[];
  const tabsData = getKeys(entry);
  tabs.push(makeGeneralTab(tabsData.general));
  tabs.push(makeWaterfallEntryTab("Timings", makeDefinitionList(tabsData.timings, true)));
  tabs.push(makeRawData(entry));
  return tabs.filter((t) => t !== undefined);
}

function makeGeneralTab(generalData: SafeKvTuple[]): WaterfallEntryTab {
  const mainContent = makeDefinitionList(generalData);
  return makeWaterfallEntryTab("General", mainContent);
}

function makeRawData(entry: PerformanceResourceTiming) {
  return makeLazyWaterfallEntryTab(
    "Raw Data",
    () => `<pre><code>${escapeHtml(JSON.stringify(entry, null, 2))}</code></pre>`,
    "raw-data",
  );
}

/** Helper to create `WaterfallEntryTab` object literal  */
function makeWaterfallEntryTab(title: string, content: string, tabClass: string = ""): WaterfallEntryTab {
  return {
    content,
    tabClass,
    title,
  };
}

/** Helper to create `WaterfallEntryTab` object literal that is evaluated lazyly at runtime (e.g. for performance) */
function makeLazyWaterfallEntryTab(title: string, renderContent: TabRenderer,
  tabClass: string = ""): WaterfallEntryTab {
  return {
    renderContent,
    tabClass,
    title,
  };
}
