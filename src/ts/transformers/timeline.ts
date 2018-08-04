import { TimelineData } from "../typing/timeline-data";
import { WaterfallDocs, WaterfallData, RequestType, WaterfallResponseDetails, TimingType, WaterfallEntryTiming } from "../typing/waterfall";
import { escapeHtml, sanitizeAlphaNumeric } from "../helpers/parse";
import { initiatorToRequestType, createWaterfallEntry, createWaterfallEntryTiming } from "./helpers";
import { makeIcon } from "../waterfall/row/svg-indicators";
import { makeTabs } from "./timeline-tabs";


/**
 * Transforms the full Timeline API doc
 * @param  {TimelineData} TLData - raw HAR object
 * @param {HarTransformerOptions} options - HAR-parser-specific options
 * @returns WaterfallDocs
 */
export function transformDoc(TLData: TimelineData): WaterfallDocs {
  const page = transformPage(TLData);

  return {
    pages: [page]
  };
}

export function transformPage(data: TimelineData): WaterfallData {
  const startedDateTime = data.reduce((earliest, curr) => {
    const currDate = new Date(curr.startTime);
    const earliestDate = new Date(earliest);
    return earliestDate < currDate ? earliest : curr.startTime;
  }, data[0].startTime);

  const pageStartTime = new Date(startedDateTime).getTime();
  let doneTime = 0;

  const entries = data.filter((entry) => {
    return entry.entryType === "resource";
  }).map((entry, index) => {
    const startRelative = new Date(entry.startTime).getTime() - pageStartTime;
    doneTime = Math.max(doneTime, startRelative + entry.duration);
    return toWaterFallEntry(entry as PerformanceResourceTiming, index, startRelative)
  })
}

/**
 * Converts 'PerformanceEntry' into PerfCascads `WaterfallEntry`
 *
 * @param  {PerformanceEntry} entry
 * @param  {number} index - resource entry index
 * @param  {number} startRelative - entry start time relative to the document in ms
 */
function toWaterFallEntry(entry: PerformanceResourceTiming, index: number, startRelative: number) {
  startRelative = Math.round(startRelative);
  const endRelative = Math.round(startRelative + entry.duration);
  const requestType = initiatorToRequestType(entry.initiatorType);
  const responseDetails = createResponseDetails(requestType);
  const waterfallTiming = buildDetailTimingBlocks(entry);
  return createWaterfallEntry(entry.name,
    startRelative,
    endRelative,
    waterfallTiming,
    responseDetails,
    makeTabs(entry, waterfallTiming),
  );
}

/**
 * Create `WaterfallEntry`s to represent the subtimings of a request
 * ("blocked", "dns", "connect", "send", "wait", "receive")
 * @param  {number} startRelative - Number of milliseconds since page load started (`page.startedDateTime`)
 * @param  {Entry} harEntry
 * @returns Array
 */
const buildDetailTimingBlocks = (entry: PerformanceResourceTiming): WaterfallEntryTiming[] => {
  const types: TimingType[] = ["blocked", "dns", "connect", "send", "wait", "receive"];
  return types.reduce((collect: WaterfallEntryTiming[], key: TimingType) => {
    const time = getTimePair(key, entry);

    if (time.end && time.start >= time.end) {
      return collect;
    }

    return collect.concat([createWaterfallEntryTiming(key, Math.round(time.start), Math.round(time.end))]);
  }, []);
};

const getTimePair = (key: TimingType, entry: PerformanceResourceTiming) => {
  switch (key) {
    case "blocked":
      return {
        end: Math.round(entry.requestStart),
        start: Math.round(entry.startTime)
      };
    case "dns":
      return {
        end: Math.round(entry.domainLookupEnd),
        start: Math.round(entry.domainLookupStart)
      };
    case "connect":
      return {
        end: Math.round(entry.connectEnd),
        start: Math.round(entry.connectStart)
      };
    case "send":
      return {
        end: Math.round(0),
        start: Math.round(0)
      };
    case "wait":
      return {
        end: Math.round(entry.responseStart),
        start: Math.round(entry.requestStart)
      };
    case "receive":
      return {
        end: Math.round(entry.responseEnd),
        start: Math.round(entry.responseStart)
      };
    default:
      return {
        end: Math.round(0),
        start: Math.round(0)
      };
  }
};

const createResponseDetails = (requestType: RequestType): WaterfallResponseDetails => {
  return {
    icon: makeIcon(sanitizeAlphaNumeric(requestType), escapeHtml(requestType)),
    indicators: [],
    requestType,
    rowClass: "row-item",
    statusCode: 200,
  };
};