import React from "react";
import "../styles/layout.css";

export default function Layout({ children }) {
  return (
    <div className="layout-container">
      {children}
    </div>
  );
}



