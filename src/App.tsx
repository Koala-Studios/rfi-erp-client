import React from "react";
import logo from "./logo.svg";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import DataTable from "./components/utils/DataTable";

function App() {
  return (
    <div className="App">
      <DataTable></DataTable>
    </div>
  );
}

export default App;
