import { useState } from "react";
import "./App.css";
import LuckySpinner from "./components/LuckySpinner";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className=" relative">
        <h2 className="fixed top-15 end-5 z-10 font-semibold text-xl text-sky-600 animate-pulse duration-500">&copy; By Pola Mounir</h2>
        <LuckySpinner />
      </div>
    </>
  );
}

export default App;
