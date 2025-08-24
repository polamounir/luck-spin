import { useState } from "react";
import "./App.css";
import LuckySpinner from "./components/LuckySpinner";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className=" relative">
        <LuckySpinner />
{/*         <h2 className="fixed top-10 start-5 z-10 font-semibold text-xl text-sky-600 animate-pulse duration-500">&copy; By Pola Mounir</h2> */}
{/*         <div className="flex justify-center items-center p-5">
          <h2 className=" font-semibold text-xl text-sky-600 animate-pulse duration-500">&copy; By Pola Mounir</h2>
        </div> */}
      </div>
    </>
  );
}

export default App;
