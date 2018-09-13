import { SafeKvTuple, KvTuple } from "../typing/waterfall";
import { formatMilliseconds } from "../helpers/parse";

/** Predicate to filter out invalid or empty `KvTuple` */
const notEmpty = (kv: KvTuple) => {
  return kv.length > 1 && kv[1] !== undefined && kv[1] !== "";
};

/**
 * Data to show in overlay tabs
 * @param  {number} requestID - request number
 * @param  {WaterfallEntry} entry
 */
export function getKeys(entry: PerformanceResourceTiming) {
  return {
    general: parseGeneralDetails(entry),
    timings: parseTimings(entry),
  };
}

function parseGeneralDetails(entry: PerformanceResourceTiming): SafeKvTuple[] {
  return ([
    ["Name", entry.name],
    ["Initiator Type", entry.initiatorType],
    ["Duration", formatMilliseconds(entry.duration)],
  ] as KvTuple[]).filter(notEmpty) as SafeKvTuple[];
}

function parseTimings(entry: PerformanceResourceTiming): SafeKvTuple[] {
  return ([
    ["Total", formatMilliseconds(entry.duration)],
    ["Blocked", formatMilliseconds(entry.requestStart - entry.startTime)],
    ["DNS", formatMilliseconds(entry.domainLookupEnd - entry.domainLookupStart)],
    ["Connect", formatMilliseconds(entry.connectEnd - entry.connectStart)],
    ["SSL (TLS)", formatMilliseconds(0)],
    ["Send", formatMilliseconds(entry.connectEnd - entry.requestStart)],
    ["Wait", formatMilliseconds(entry.responseStart - entry.requestStart)],
    ["Receive", formatMilliseconds(entry.responseEnd - entry.responseStart)],
  ] as KvTuple[]).filter(notEmpty) as SafeKvTuple[];
}