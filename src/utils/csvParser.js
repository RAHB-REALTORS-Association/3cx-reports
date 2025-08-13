import Papa from "papaparse";
import { hmsToSeconds, pctToFloat } from "./formatters";

// New function for Agent Login History report
function parseAgentLoginHistory(rows) {
  const out = [];
  let currentAgent = null;

  for (const row of rows) {
    // Agent name is in the first column, e.g., "222 Maria Kovljenic"
    const agentMatch = /^\d+\s+(.*)/.exec(row[0]);
    if (agentMatch) {
      currentAgent = agentMatch[1].trim();
    }

    // Total line contains the total logged in time
    if (row[0] && row[0].trim() === "Total:" && currentAgent) {
      const loggedInTimeHms = row[5];
      if (loggedInTimeHms) {
        out.push({
          Agent: currentAgent,
          "Total Logged in Time (s)": hmsToSeconds(loggedInTimeHms),
        });
      }
      currentAgent = null; // Reset for next agent
    }
  }
  return out;
}

function findHeaderRow(rows) {
  // Look for a row whose first cell is exactly "Agent"
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === "Agent") return i;
  }
  return -1; // fallback similar to the Python script
}

// Refactored function for the original Agent Performance report
function parseAgentPerformance(rows) {
  const headerRowIndex = findHeaderRow(rows);
  if (headerRowIndex === -1) return []; // Not a performance report

  const header = rows[headerRowIndex];
  const body = rows.slice(headerRowIndex + 1);
  // Map headers to standard names like the python version
  const rename = {
    "Unnamed: 1": "Agent Extra",
    "Unnamed: 3": "Queue Extra",
    Calls: "Calls Answered",
    "Unnamed: 6": "% Calls Serviced",
    "Unnamed: 7": "Answered per Hour",
    "Unnamed: 9": "Mean Ring Time",
    "Unnamed: 11": "Mean Talk Time",
  };
  const idx = {};
  header.forEach((h, i) => {
    const name = rename[h] || h;
    idx[name] = i;
  });
  // Normalize rows into objects
  const out = [];
  for (const r of body) {
    const agent = (r[idx["Agent"]] || "").toString();
    if (!agent || agent === "Agent" || agent === "Total:") continue;
    const rec = {
      Agent: agent,
      Queue: idx["Queue"] != null ? r[idx["Queue"]] : undefined,
      "Total Logged in Time": r[idx["Total Logged in Time"]],
      "Calls Answered": Number(r[idx["Calls Answered"]] || 0) || 0,
      "% Calls Serviced": r[idx["% Calls Serviced"]],
      "Answered per Hour": r[idx["Answered per Hour"]],
      "Ring Time": r[idx["Ring Time"]],
      "Mean Ring Time": r[idx["Mean Ring Time"]],
      "Talk Time": r[idx["Talk Time"]],
      "Mean Talk Time": r[idx["Mean Talk Time"]],
    };
    // derived seconds
    [
      "Total Logged in Time",
      "Ring Time",
      "Mean Ring Time",
      "Talk Time",
      "Mean Talk Time",
    ].forEach((k) => {
      if (rec[k] != null) rec[k + " (s)"] = hmsToSeconds(rec[k]);
    });
    if (rec["% Calls Serviced"] != null)
      rec["% Calls Serviced (num)"] = pctToFloat(rec["% Calls Serviced"]);
    if (rec["Answered per Hour"] != null) {
      const n = parseFloat(rec["Answered per Hour"]);
      rec["Answered per Hour (num)"] = isNaN(n) ? null : n;
    }
    out.push(rec);
  }
  return out;
}

export function parseCSVContent(content, filename) {
  const parsed = Papa.parse(content, {
    delimiter: ",",
    skipEmptyLines: "greedy",
  });
  const rows = parsed.data;

  let reportType = "performance"; // default
  let dataRows = [];

  // Determine report type
  if (rows.length > 0 && rows[0][0].includes("Queue Agent Logins")) {
    reportType = "login";
    dataRows = parseAgentLoginHistory(rows);
  } else {
    dataRows = parseAgentPerformance(rows);
  }

  // Try to infer date from filename (YYYY-MM-DD, DDMM, or Jul 7 2025 etc.)
  let date = null;
  const f = filename || "";

  // First try YYYY-MM-DD format
  const ymd = f.match(/(20\d{2})[-_](\d{1,2})[-_](\d{1,2})/);
  if (ymd) {
    date = new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
  }

  // Then try _DDMM_ format (like _1308_ for August 13)
  if (!date) {
    const ddmm = f.match(/_(\d{2})(\d{2})_/);
    if (ddmm) {
      const day = Number(ddmm[1]);
      const month = Number(ddmm[2]);
      const year = new Date().getFullYear();
      // Validate day and month ranges
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        date = new Date(year, month - 1, day);
      }
    }
  }

  // Finally try month name format
  if (!date) {
    const monMap = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };
    const m = f
      .toLowerCase()
      .match(
        /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[_\- ]?(\d{1,2})[, _\- ]?(20\d{2})?/
      );
    if (m) {
      date = new Date(
        Number(m[3] || new Date().getFullYear()),
        monMap[m[1]],
        Number(m[2])
      );
    }
  }
  return {
    rows: dataRows,
    type: reportType,
    dateHint: date ? date.toISOString().slice(0, 10) : null,
  };
}
