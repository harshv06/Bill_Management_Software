import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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

function App() {
  const [count, setCount] = useState(0);
  return (
    <>

      <Router>
        <div>
          {/* <Sidebar/> */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/lander" element={<Provider store={store}>
              <Lander />
            </Provider>} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
