import React from "react";
import { fmtNum, fmt1 } from "../utils/formatters";

const KpiGrid = ({ kpis }) => {
  return (
    <section className="grid kpis">
      <div className="card kpi">
        <div>
          <h2>Total Calls</h2>
          <div className="val">{fmtNum(kpis.total_calls)}</div>
        </div>
        <span className="pill">Calls</span>
      </div>
      <div className="card kpi">
        <div>
          <h2>Avg Answered / Hour</h2>
          <div className="val">{fmt1(kpis.avg_answered_per_hour)}</div>
        </div>
        <span className="pill">Rate</span>
      </div>
      <div className="card kpi">
        <div>
          <h2>Avg Ring Time</h2>
          <div className="val">{kpis.avg_ring}</div>
        </div>
        <span className="pill">Time</span>
      </div>
      <div className="card kpi">
        <div>
          <h2>Avg Talk Time</h2>
          <div className="val">{kpis.avg_talk}</div>
        </div>
        <span className="pill">Time</span>
      </div>
    </section>
  );
};

export default KpiGrid;
