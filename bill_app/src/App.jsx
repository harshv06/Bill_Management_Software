import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Lander from "./pages/Lander";
import { Provider, useSelector } from "react-redux";
import store from "../store/store";

function App() {
  const [count, setCount] = useState(0);
  return (
    <Provider store={store}>
      <Lander />
    </Provider>
  );
}

export default App;
