import { WaterfallEntryTab, WaterfallEntryTiming } from "../typing/waterfall";

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
export function makeTabs(entry: PerformanceResourceTiming, timings: WaterfallEntryTiming[]): WaterfallEntryTab[] {
const tabs = [] as WaterfallEntryTab[];

const tabsData = getKeys(entry, timings);
tabs.push(makeGeneralTab(tabsData.general));
tabs.push(makeWaterfallEntryTab("Timings", makeDefinitionList(tabsData.timings, true)));
tabs.push(makeRawData(entry));
if (requestType === "image") {
tabs.push(makeImgTab(entry));
}
return tabs.filter((t) => t !== undefined);
}