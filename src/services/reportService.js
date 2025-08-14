import { listFiles } from "../utils/dataStore";
import { secondsToHMS, hmsToSeconds } from "../utils/formatters";
import { simpleHash } from "../utils/simpleHash";

const CACHE_KEY = "ivr_dash_cache_v2";

function filesInRange(range) {
  const files = listFiles();
  return files.filter((f) => {
    if (!f.date) return false;
    
    // If file has a dateRange (spans multiple days), check for overlap
    if (f.dateRange && f.dateRange.from && f.dateRange.to) {
      // File overlaps with range if:
      // - File starts before or on range end AND
      // - File ends after or on range start
      return f.dateRange.from <= range.to && f.dateRange.to >= range.from;
    }
    
    // Fallback to single date check for legacy files
    return f.date >= range.from && f.date <= range.to;
  });
}

function cacheKeyFor(range) {
  const fs = filesInRange(range);
  const sig = fs
    .map((f) => {
      // Include both single date and date range in cache signature
      const dateInfo = f.dateRange 
        ? `${f.dateRange.from}-${f.dateRange.to}` 
        : (f.date || "");
      return f.id + ":" + dateInfo;
    })
    .sort()
    .join("|");
  return `${range.from}_${range.to}__${simpleHash(sig)}`;
}

export function build(range) {
  const cacheKey = cacheKeyFor(range);
  const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  const fs = filesInRange(range);
  const allRows = fs.flatMap((f) => f.rows);

  // Check if any files extend beyond the selected range
  const dateRangeWarnings = [];
  fs.forEach((f) => {
    if (f.dateRange && f.dateRange.from && f.dateRange.to) {
      if (f.dateRange.from < range.from || f.dateRange.to > range.to) {
        dateRangeWarnings.push({
          filename: f.name,
          fileRange: f.dateRange,
          selectedRange: range
        });
      }
    }
  });

  // aggregate by Agent
  const byAgent = new Map();
  for (const r of allRows) {
    const key = r.Agent || "Unknown";
    const acc = byAgent.get(key) || {
      Agent: key,
      Calls: 0,
      Logged: 0,
      Ring: 0,
      Talk: 0,
    };
    acc.Calls += Number(r["Calls Answered"] || 0);
    acc.Logged += Number(r["Total Logged in Time (s)"] || 0);
    acc.Ring += Number(r["Ring Time (s)"] || 0);
    acc.Talk += Number(r["Talk Time (s)"] || 0);
    byAgent.set(key, acc);
  }

  const table = Array.from(byAgent.values())
    .map((x) => {
      const ansPerHour = x.Logged > 0 ? x.Calls / (x.Logged / 3600) : 0;
      const meanRing = x.Calls > 0 ? x.Ring / x.Calls : 0;
      const meanTalk = x.Calls > 0 ? x.Talk / x.Calls : 0;
      return {
        agent: x.Agent,
        calls: x.Calls,
        logged_in: secondsToHMS(x.Logged),
        ans_per_hour: ansPerHour,
        mean_ring: secondsToHMS(meanRing),
        mean_talk: secondsToHMS(meanTalk),
      };
    })
    .sort((a, b) => b.calls - a.calls);

  const totalCalls = table.reduce((s, r) => s + r.calls, 0);
  const avgAph =
    table.length > 0
      ? table.reduce((s, r) => s + r.ans_per_hour, 0) / table.length
      : 0;
  const avgRing =
    table.length > 0
      ? table.reduce((s, r) => s + hmsToSeconds(r.mean_ring), 0) / table.length
      : 0; // seconds
  const avgTalk =
    table.length > 0
      ? table.reduce((s, r) => s + hmsToSeconds(r.mean_talk), 0) / table.length
      : 0; // seconds

  const data = {
    agents: table.map((r) => r.agent),
    calls_per_agent: table.map((r) => r.calls),
    mean_talk_time: table.map((r) => hmsToSeconds(r.mean_talk)),
    mean_ring_time: table.map((r) => hmsToSeconds(r.mean_ring)),
    answered_per_hour: table.map((r) => r.ans_per_hour),
    table,
    kpis: {
      total_calls: totalCalls,
      avg_answered_per_hour: Number(avgAph.toFixed(2)),
      avg_ring: secondsToHMS(avgRing),
      avg_talk: secondsToHMS(avgTalk),
    },
    meta: {
      files: fs.map((f) => ({
        name: f.name,
        date: f.date,
        dateRange: f.dateRange,
        rows: f.rows.length,
      })),
      dateRangeWarnings, // Include warnings about files that extend beyond selected range
      selectedRange: range,
    },
  };

  cache[cacheKey] = data;
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  return data;
}
