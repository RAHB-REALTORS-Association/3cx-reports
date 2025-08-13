import React from "react";
import BarChart from "./BarChart";

const ChartGrid = ({ data }) => {
  const truncate = (s) => (s.length > 18 ? s.slice(0, 18) + "…" : s);
  const labels = data.agents.map(truncate);

  return (
    <section className="charts">
      <div className="card chart-card">
        <BarChart
          labels={labels}
          values={data.calls_per_agent}
          title="Calls per Agent"
          color="#2563eb"
        />
      </div>
      <div className="card chart-card">
        <BarChart
          labels={labels}
          values={data.mean_talk_time}
          title="Average Talk Time by Agent"
          color="#059669"
        />
      </div>
      <div className="card chart-card">
        <BarChart
          labels={labels}
          values={data.mean_ring_time}
          title="Average Ring Time by Agent"
          color="#dc2626"
        />
      </div>
      <div className="card chart-card">
        <BarChart
          labels={labels}
          values={data.answered_per_hour}
          title="Answered per Hour by Agent"
          color="#7c3aed"
        />
      </div>
    </section>
  );
};

export default ChartGrid;
