import React, { useState, useMemo } from "react";
import { fmtNum, fmt1 } from "../utils/formatters";

const AgentTable = ({ tableData, meta, kpis }) => {
  const [sortConfig, setSortConfig] = useState({
    key: "agent",
    direction: "ascending",
  });

  const sortedTableData = useMemo(() => {
    let sortableItems = [...tableData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [tableData, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getClassNamesFor = (name) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  return (
    <section className="card table-card">
      <div
        className="row"
        style={{
          padding: "12px 16px",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>
          Agent Performance Summary
        </div>
        <div className="muted">
          {meta.files.length} file(s) • {fmtNum(kpis.total_calls)} calls
        </div>
      </div>
      <div style={{ maxHeight: "420px", overflow: "auto" }}>
        <table>
          <thead>
            <tr>
              <th
                onClick={() => requestSort("agent")}
                className={getClassNamesFor("agent")}
              >
                Agent
              </th>
              <th
                onClick={() => requestSort("calls")}
                className={getClassNamesFor("calls")}
              >
                Calls
              </th>
              <th
                onClick={() => requestSort("logged_in")}
                className={getClassNamesFor("logged_in")}
              >
                Logged In
              </th>
              <th
                onClick={() => requestSort("ans_per_hour")}
                className={getClassNamesFor("ans_per_hour")}
              >
                Answered / Hour
              </th>
              <th
                onClick={() => requestSort("mean_ring")}
                className={getClassNamesFor("mean_ring")}
              >
                Mean Ring
              </th>
              <th
                onClick={() => requestSort("mean_talk")}
                className={getClassNamesFor("mean_talk")}
              >
                Mean Talk
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTableData.map((r) => (
              <tr key={r.agent}>
                <td>{r.agent}</td>
                <td>{fmtNum(r.calls)}</td>
                <td>{r.logged_in}</td>
                <td>{fmt1(r.ans_per_hour)}</td>
                <td>{r.mean_ring}</td>
                <td>{r.mean_talk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AgentTable;
