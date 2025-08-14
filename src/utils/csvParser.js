import Papa from "papaparse";
import { hmsToSeconds, pctToFloat } from "./formatters";

function findHeaderRow(rows) {
  // Look for a row whose first cell is exactly "Agent"
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === "Agent") return i;
  }
  return 4; // fallback similar to the Python script
}

function extractDateFromCSV(rows) {
  // Look for date range in the first few rows
  // Format: "From 8/12/2025 12:00:00 AM To 8/12/2025 11:59:59 PM"
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const rowText = rows[i].join(' ').trim();
    
    // Match the date range pattern
    const dateMatch = rowText.match(/From\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+\d{1,2}:\d{2}:\d{2}\s+[AP]M\s+To\s+(\d{1,2}\/\d{1,2}\/\d{4})/i);
    
    if (dateMatch) {
      const fromDate = dateMatch[1]; // e.g., "8/12/2025"
      const toDate = dateMatch[2];   // e.g., "8/12/2025"
      
      // Parse the date (MM/DD/YYYY format)
      const parseDate = (dateStr) => {
        const [month, day, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      };
      
      try {
        const from = parseDate(fromDate);
        const to = parseDate(toDate);
        
        // Return ISO date strings
        return {
          from: from.toISOString().slice(0, 10),
          to: to.toISOString().slice(0, 10)
        };
      } catch (e) {
        console.warn('Failed to parse dates from CSV header:', dateMatch);
      }
    }
  }
  
  return null;
}

export function parseCSVContent(content, filename) {
  const parsed = Papa.parse(content, {
    delimiter: ",",
    skipEmptyLines: "greedy",
  });
  const rows = parsed.data;
  
  // Extract date range from CSV header first
  const csvDateRange = extractDateFromCSV(rows);
  
  const headerRowIndex = findHeaderRow(rows);
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
  
  // Use CSV date range if available, otherwise try to infer from filename
  let dateHint = null;
  let dateRange = null;
  
  if (csvDateRange) {
    // For multi-day data, use the "from" date as the primary identifier
    // but store the full range so the system knows this file spans multiple days
    dateHint = csvDateRange.from;
    dateRange = csvDateRange;
    
    // If it's a single day, keep the same date for both from/to
    // If it spans multiple days, the range will be preserved
  } else {
    // Fallback to filename parsing if CSV doesn't contain date info
    const f = filename || "";

    // First try YYYY-MM-DD format
    const ymd = f.match(/(20\d{2})[-_](\d{1,2})[-_](\d{1,2})/);
    if (ymd) {
      const date = new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
      dateHint = date.toISOString().slice(0, 10);
    }

    // Then try _DDMM_ format (like _1308_ for August 13)
    if (!dateHint) {
      const ddmm = f.match(/_(\d{2})(\d{2})_/);
      if (ddmm) {
        const day = Number(ddmm[1]);
        const month = Number(ddmm[2]);
        const year = new Date().getFullYear();
        // Validate day and month ranges
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
          const date = new Date(year, month - 1, day);
          dateHint = date.toISOString().slice(0, 10);
        }
      }
    }

    // Finally try month name format
    if (!dateHint) {
      const monMap = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
      };
      const m = f
        .toLowerCase()
        .match(
          /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[_\- ]?(\d{1,2})[, _\- ]?(20\d{2})?/
        );
      if (m) {
        const date = new Date(
          Number(m[3] || new Date().getFullYear()),
          monMap[m[1]],
          Number(m[2])
        );
        dateHint = date.toISOString().slice(0, 10);
      }
    }
  }
  
  return { 
    rows: out, 
    dateHint, 
    dateRange // Include the full date range for potential future use
  };
}
