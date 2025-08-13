export const hmsToSeconds = (x) => {
  if (x == null) return 0;
  const s = String(x).trim();
  if (!s || s === "0") return 0;
  const parts = s.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  const f = parseFloat(s);
  return isNaN(f) ? 0 : Math.round(f);
};

export const secondsToHMS = (secs) => {
  secs = Math.round(secs || 0);
  const h = Math.floor(secs / 3600),
    m = Math.floor((secs % 3600) / 60),
    s = secs % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const fmtNum = (n) => (typeof n === "number" ? n.toLocaleString() : "-");
export const pctToFloat = (x) => {
  if (x == null) return null;
  const s = String(x).trim().replace("%", "");
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
};

export const fmt1 = (n) => (typeof n === "number" ? n.toFixed(1) : "-");
