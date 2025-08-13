import React from "react";

const Header = ({ data, range }) => {
  const nice = (iso) =>
    new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const rangeText =
    range.from && range.to
      ? range.from === range.to
        ? nice(range.from)
        : `${nice(range.from)} – ${nice(range.to)}`
      : "";

  const title = data
    ? `Queue Agent Dashboard — ${rangeText}`
    : "Queue Agent Dashboard";

  return (
    <header className="header">
      <div className="title">
        <h1>{title}</h1>
      </div>
    </header>
  );
};

export default Header;
