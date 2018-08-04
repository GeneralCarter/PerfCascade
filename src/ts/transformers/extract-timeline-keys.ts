import { SafeKvTuple, KvTuple, WaterfallEntryTiming } from "../typing/waterfall";
import { formatMilliseconds, parseAndFormat } from "../helpers/parse";

/** Predicate to filter out invalid or empty `KvTuple` */
const notEmpty = (kv: KvTuple) => {
  return kv.length > 1 && kv[1] !== undefined && kv[1] !== "";
};

/**
 * Data to show in overlay tabs
 * @param  {number} requestID - request number
 * @param  {WaterfallEntry} entry
 */
export function getKeys(entry: PerformanceResourceTiming, timings: WaterfallEntryTiming[]) {
  return {
    general: parseGeneralDetails(entry),
    timings: parseTimings(entry, timings),
  };
}


function parseGeneralDetails(entry: PerformanceResourceTiming): SafeKvTuple[] {
  return ([
    ["Name", entry.name],
    ["Initiator Type", entry.initiatorType],
    ["Duration", formatMilliseconds(entry.duration)]
  ] as KvTuple[]).filter(notEmpty) as SafeKvTuple[];
}

function parseTimings(entry: PerformanceResourceTiming, timings: WaterfallEntryTiming[]): SafeKvTuple[] {
  return ([
    ["Total", formatMilliseconds(entry.duration)],
    ["Blocked", optionalTiming(timings.)],
    ["DNS", optionalTiming(timings.dns)],
    ["Connect", connectVal],
    ["SSL (TLS)", optionalTiming(timings.ssl)],
    ["Send", formatMilliseconds(timings.send)],
    ["Wait", formatMilliseconds(timings.wait)],
    ["Receive", formatMilliseconds(timings.receive)],
  ] as KvTuple[]).filter(notEmpty) as SafeKvTuple[];
}