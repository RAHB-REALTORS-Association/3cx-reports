import { listFiles } from "../utils/dataStore";
import { secondsToHMS, hmsToSeconds } from "../utils/formatters";
import { simpleHash } from "../utils/simpleHash";

const CACHE_KEY = "ivr_dash_cache_v2";

function filesInRange(range) {
  const files = listFiles();
  return files.filter((f) => {
    if (!f.date) return false;
    return f.date >= range.from && f.date <= range.to;
  });
}

function cacheKeyFor(range) {
  const fs = filesInRange(range);
  const sig = fs
    .map((f) => f.id + ":" + (f.date || ""))
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

  // Process login reports first to get accurate login times
  const loginTimeByAgent = new Map();
  const loginFiles = fs.filter((f) => f.type === "login");
  for (const file of loginFiles) {
    for (const row of file.rows) {
      const agent = row.Agent || "Unknown";
      const existing = loginTimeByAgent.get(agent) || 0;
      loginTimeByAgent.set(
        agent,
        existing + (row["Total Logged in Time (s)"] || 0)
      );
    }
  }

  // Process performance reports
  const byAgent = new Map();
  const perfFiles = fs.filter((f) => f.type === "performance" || !f.type); // !f.type for backwards compat
  const allPerfRows = perfFiles.flatMap((f) => f.rows);

  for (const r of allPerfRows) {
    const key = r.Agent || "Unknown";
    const acc = byAgent.get(key) || {
      Agent: key,
      Calls: 0,
      Logged: 0,
      Ring: 0,
      Talk: 0,
    };
    acc.Calls += Number(r["Calls Answered"] || 0);
    // Use performance report logged in time only if no login report is available
    if (!loginTimeByAgent.has(key)) {
      acc.Logged += Number(r["Total Logged in Time (s)"] || 0);
    }
    acc.Ring += Number(r["Ring Time (s)"] || 0);
    acc.Talk += Number(r["Talk Time (s)"] || 0);
    byAgent.set(key, acc);
  }

  // Add agent data from login reports, ensuring they appear in the table
  // even if they have no performance data.
  for (const [agent, loggedTime] of loginTimeByAgent.entries()) {
    if (!byAgent.has(agent)) {
      byAgent.set(agent, {
        Agent: agent,
        Calls: 0,
        Logged: loggedTime,
        Ring: 0,
        Talk: 0,
      });
    } else {
      // If agent exists, just update the logged in time.
      byAgent.get(agent).Logged = loggedTime;
    }
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
        rows: f.rows.length,
      })),
    },
  };

  cache[cacheKey] = data;
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  return data;
}
