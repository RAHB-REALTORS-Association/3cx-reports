import React from "react";
import { fmtNum, fmt1 } from "../utils/formatters";

const AgentTable = ({ tableData, meta, kpis }) => {
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
              <th>Agent</th>
              <th>Calls</th>
              <th>Logged In</th>
              <th>Answered / Hour</th>
              <th>Mean Ring</th>
              <th>Mean Talk</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((r) => (
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
