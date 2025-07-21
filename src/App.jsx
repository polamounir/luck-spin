import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import LuckySpinner from "./components/LuckySpinner";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className=" relative">
        <h2 className="fixed top-2 end-2 z-10 font-semibold text-xl text-sky-600 animate-pulse duration-500">&copy; By Pola Mounir</h2>
        <LuckySpinner />
      </div>
    </>
  );
}

export default App;
