import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Lander from "./pages/Lander";
import { Provider, useSelector } from "react-redux";
import store from "../store/store";
import Sidebar from "./components/Sidebar";
import Clients from "./components/Clients";
import Dashboard from "./components/Dashboard";
import Invoices from "./components/Invoices";
import Reports from "./components/Reports";
import Settings from "./components/Settings";
import Fleet from "./components/Fleet";
import CarDetails from "./pages/CarDetails";

function App() {
  const [count, setCount] = useState(0);
  return (
    <Provider store={store}>
      <Router>
        <div>
          {/* <Sidebar/> */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/lander" element={<Lander />} />
            <Route path="/fleet/details" element={<CarDetails />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
