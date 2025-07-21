import React, { useState, useEffect, useRef } from "react";
import {
  Trash2,
  Edit3,
  Save,
  X,
  RotateCcw,
  Download,
  Upload,
  Moon,
  Sun,
  Shuffle,
} from "lucide-react";
import { Howl } from "howler";

const spinSound = new Howl({
  src: ["/audio/spin.mp3"],
  loop: true,
  volume: 0.5,
});

const clapSound = new Howl({
  src: ["/audio/clap.mp3"],
  volume: 0.8,
});

// --- NEW: Reusable ConfirmationModal Component ---
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  darkMode,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/10 bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div
        className={`${
          darkMode ? "bg-gray-800" : "bg-white"
        } rounded-lg p-6 shadow-xl w-full max-w-sm`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className={`hover:text-red-500 ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <X size={24} />
          </button>
        </div>
        <div className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
          {children}
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg transition-colors ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const LuckySpinner = () => {
//   const [options, setOptions] = useState([]);
//   const [results, setResults] = useState([]);
  const [newOption, setNewOption] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
//   const [darkMode, setDarkMode] = useState(false);
  const wheelRef = useRef(null);
  const animationRef = useRef(null);

  const [options, setOptions] = useState(() => {
    try {
      const savedOptions = localStorage.getItem("luckySpinner_options");
      return savedOptions ? JSON.parse(savedOptions) : [];
    } catch (error) {
      console.error("Failed to load options from localStorage:", error);
      return []; // Return a default value in case of an error
    }
  });

  const [results, setResults] = useState(() => {
    try {
      const savedResults = localStorage.getItem("luckySpinner_results");
      return savedResults ? JSON.parse(savedResults) : [];
    } catch (error) {
      console.error("Failed to load results from localStorage:", error);
      return [];
    }
  });

  const [darkMode, setDarkMode] = useState(() => {
    try {
      const savedDarkMode = localStorage.getItem("luckySpinner_darkMode");
      // Check for null to avoid parsing errors
      return savedDarkMode ? JSON.parse(savedDarkMode) : false;
    } catch (error) {
      console.error("Failed to load dark mode from localStorage:", error);
      return false;
    }
  });

  // --- NEW: State for the confirmation modal ---
  const [modalState, setModalState] = useState({
    isOpen: false,
    message: "",
    onConfirm: () => {},
  });

//   // Load data from localStorage on component mount
//   useEffect(() => {
//     const savedOptions = localStorage.getItem("luckySpinner_options");
//     const savedResults = localStorage.getItem("luckySpinner_results");
//     const savedDarkMode = localStorage.getItem("luckySpinner_darkMode");

//     if (savedOptions) {
//       setOptions(JSON.parse(savedOptions));
//     }
//     if (savedResults) {
//       setResults(JSON.parse(savedResults));
//     }
//     if (savedDarkMode) {
//       setDarkMode(JSON.parse(savedDarkMode));
//     }
//   }, []);

  useEffect(() => {
    localStorage.setItem("luckySpinner_options", JSON.stringify(options));
  }, [options]);

  useEffect(() => {
    localStorage.setItem("luckySpinner_results", JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    localStorage.setItem("luckySpinner_darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (showWinner && winner) {
      clapSound.play();
    }
  }, [showWinner, winner]);

  // --- NEW: Helper functions to control the modal ---
  const showConfirmationModal = (message, confirmAction) => {
    setModalState({
      isOpen: true,
      message: message,
      onConfirm: () => {
        confirmAction();
        hideConfirmationModal();
      },
    });
  };

  const hideConfirmationModal = () => {
    setModalState({ isOpen: false, message: "", onConfirm: () => {} });
  };

  const generateColors = (count) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const hue = ((i * 360) / count) % 360;
      const saturation = 70 + (i % 3) * 10;
      const lightness = 50 + (i % 4) * 10;
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
  };

  const addOption = () => {
    if (newOption.trim() && options.length < 500) {
      const newItem = {
        id: Date.now(),
        text: newOption.trim(),
        active: true,
      };
      setOptions([...options, newItem]);
      setNewOption("");
    }
  };

  const deleteOption = (id) => {
    setOptions(options.filter((opt) => opt.id !== id));
  };

  const startEdit = (option) => {
    setEditingId(option.id);
    setEditText(option.text);
  };

  const saveEdit = () => {
    setOptions(
      options.map((opt) =>
        opt.id === editingId ? { ...opt, text: editText.trim() } : opt
      )
    );
    setEditingId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const sortOptions = () => {
    const sorted = [...options].sort((a, b) => a.text.localeCompare(b.text));
    setOptions(sorted);
  };

  const shuffleOptions = () => {
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setOptions(shuffled);
  };

  const spin = () => {
    const activeOptions = options.filter((opt) => opt.active);
    if (activeOptions.length === 0) {
      alert("No options available to spin!");
      return;
    }

    setSpinning(true);
    setShowWinner(false);
    spinSound.play();

    const selectedIndex = Math.floor(Math.random() * activeOptions.length);
    const selectedOption = activeOptions[selectedIndex];
    const segmentAngle = 360 / activeOptions.length;
    const segmentCenter = selectedIndex * segmentAngle + segmentAngle / 2;
    const targetFinalAngle = (270 - segmentCenter + 360) % 360;
    const extraSpins = Math.floor(Math.random() * 4) + 5;
    const currentAngle = rotation % 360;
    const angleToTravel = (targetFinalAngle - currentAngle + 360) % 360;
    const finalRotation = rotation + extraSpins * 360 + angleToTravel;

    const startTime = Date.now();
    const duration = 4000;
    const startRotation = rotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRotation =
        startRotation + (finalRotation - startRotation) * easeOut;
      setRotation(currentRotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setRotation(finalRotation);
        setOptions(
          options.map((opt) =>
            opt.id === selectedOption.id ? { ...opt, active: false } : opt
          )
        );
        setResults([...results, { ...selectedOption, timestamp: Date.now() }]);
        setWinner(selectedOption.text);
        setSpinning(false);
        setShowWinner(true);
        spinSound.stop();
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);
  };

  // --- MODIFIED: Uses the confirmation modal ---
  const resetWheel = () => {
    showConfirmationModal(
      "Are you sure you want to reset the wheel? All options will become active again.",
      () => {
        setOptions(options.map((opt) => ({ ...opt, active: true })));
        setRotation(0);
        setWinner(null);
        setShowWinner(false);
      }
    );
  };

  // --- MODIFIED: Uses the confirmation modal ---
  const clearResults = () => {
    showConfirmationModal(
      "Are you sure you want to clear all results history? This action cannot be undone.",
      () => {
        setResults([]);
      }
    );
  };

  // --- NEW: Function to clear all options with confirmation ---
  const clearAllOptions = () => {
    showConfirmationModal(
      "Are you sure you want to delete all options? This action cannot be undone.",
      () => {
        setOptions([]);
      }
    );
  };

  const exportData = () => {
    const data = { options, results };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lucky-spinner-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.options) setOptions(data.options);
          if (data.results) setResults(data.results);
        } catch (error) {
          alert("Invalid file format");
        }
      };
      reader.readAsText(file);
    }
  };

  const WheelComponent = () => {
    const activeOptions = options.filter((opt) => opt.active);
    const colors = generateColors(activeOptions.length);

    if (activeOptions.length === 0) {
      return (
        <div
          className={`w-[620px] h-[600px] rounded-full border-4 ${
            darkMode
              ? "border-gray-600 bg-gray-800"
              : "border-gray-300 bg-gray-100"
          } flex items-center justify-center`}
        >
          <p
            className={`text-lg ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No options available
          </p>
        </div>
      );
    }

    const radius = 300;
    const centerX = 310;
    const centerY = 310;
    const segmentAngle = 360 / activeOptions.length;

    return (
      <div className="relative">
        <svg
          ref={wheelRef}
          width="620"
          height="620"
          className={`drop-shadow-lg ${
            spinning ? "transition-transform duration-[4000ms] ease-out" : ""
          }`}
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "50% 50%",
          }}
        >
          {activeOptions.map((option, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = (index + 1) * segmentAngle;
            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;

            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);

            const largeArcFlag = segmentAngle > 180 ? 1 : 0;
            const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            const textAngle = startAngle + segmentAngle / 2;
            const textAngleRad = (textAngle * Math.PI) / 180;
            const textRadius = radius * 0.7;
            const textX = centerX + textRadius * Math.cos(textAngleRad);
            const textY = centerY + textRadius * Math.sin(textAngleRad);

            return (
              <g key={option.id}>
                <path
                  d={pathData}
                  fill={colors[index]}
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={textX}
                  y={textY}
                  fill="white"
                  fontSize={Math.min(12, 120 / Math.sqrt(activeOptions.length))}
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                >
                  {option.text.length > 15
                    ? option.text.substring(0, 15) + "..."
                    : option.text}
                </text>
              </g>
            );
          })}

          <circle
            cx={centerX}
            cy={centerY}
            r="20"
            fill={darkMode ? "#1f2937" : "#ffffff"}
            stroke="#6b7280"
            strokeWidth="3"
          />
        </svg>

        <div
          className={`absolute top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-16 border-r-16 border-t-32 border-l-transparent border-r-transparent ${
            darkMode ? "border-t-yellow-400" : "border-t-red-400"
          }`}
        ></div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen transition-colors relative duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center ">
          <div className="flex gap-2 fixed top-15 start-5 z-10 shadow-lg rounded-2xl">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-white hover:bg-gray-100"
              } transition-colors`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          <div
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } rounded-xl p-6 shadow-lg flex flex-col items-center relative`}
          >
            <div>
              <WheelComponent />

              <div className="mt-6 flex gap-4 justify-center">
                <button
                  onClick={spin}
                  disabled={
                    spinning || options.filter((opt) => opt.active).length === 0
                  }
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    spinning || options.filter((opt) => opt.active).length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  } text-white`}
                >
                  {spinning ? "Spinning..." : "SPIN!"}
                </button>

                <button
                  onClick={resetWheel}
                  className={`px-4 py-3 rounded-lg ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  } transition-colors`}
                >
                  <RotateCcw size={20} />
                </button>
                <div className="mt-4 text-center text-sm opacity-75">
                  Active options: {options.filter((opt) => opt.active).length} /{" "}
                  {options.length}
                </div>
              </div>
            </div>

            {showWinner && winner && (
              <div
                className={`absolute top-[50%] left-[50%] translate-[-50%] mt- p-20 rounded-lg ${
                  darkMode
                    ? "bg-yellow-900 border-yellow-700"
                    : "bg-yellow-100 border-yellow-300"
                } border-2 text-center animate-pulse`}
              >
                <h3 className="text-lg font-bold mb-2">🎉 Winner! 🎉</h3>
                <p className="text-2xl font-semibold">{winner}</p>
                <button
                  onClick={()=>{
                    setShowWinner(false)
                  }}
                  className={` absolute top-5 end-5 cursor-pointer hover:text-red-500 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <X size={24} />
                </button>
              </div>
            )}
          </div>
          <div className="grid gap-10 grid-cols-1 lg:grid-cols-2">
            <div
              className={`${
                darkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl p-6 shadow-lg`}
            >
              <h2 className="text-xl font-semibold mb-4">
                Options ({options.length}/500)
              </h2>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addOption()}
                  placeholder="Add new option..."
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                  maxLength={100}
                />
                <button
                  onClick={addOption}
                  disabled={options.length >= 500}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                <button
                  onClick={sortOptions}
                  className={`px-3 py-1 text-sm rounded ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  } transition-colors`}
                >
                  Sort A-Z
                </button>
                <button
                  onClick={shuffleOptions}
                  className={`px-3 py-1 text-sm rounded ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  } transition-colors flex items-center gap-1`}
                >
                  <Shuffle size={14} /> Shuffle
                </button>
                <label
                  className={`px-3 py-1 text-sm rounded ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  } transition-colors cursor-pointer flex items-center gap-1`}
                >
                  <Upload size={14} /> Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={exportData}
                  className={`px-3 py-1 text-sm rounded ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  } transition-colors flex items-center gap-1`}
                >
                  <Download size={14} /> Export
                </button>
                {/* --- NEW: Clear All Options Button --- */}
                <button
                  onClick={clearAllOptions}
                  disabled={options.length === 0}
                  className={`px-3 py-1 text-sm rounded transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode
                      ? "bg-red-900 text-red-300 hover:bg-red-800"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  <Trash2 size={14} /> Clear All
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {options.map((option) => (
                  <div
                    key={option.id}
                    className={`p-3 rounded-lg border ${
                      option.active
                        ? darkMode
                          ? "bg-gray-700 border-gray-600"
                          : "bg-gray-50 border-gray-200"
                        : darkMode
                        ? "bg-gray-800 border-gray-700 opacity-50"
                        : "bg-gray-100 border-gray-300 opacity-50"
                    } flex items-center gap-2`}
                  >
                    {editingId === option.id ? (
                      <>
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className={`flex-1 px-2 py-1 rounded ${
                            darkMode ? "bg-gray-600 text-white" : "bg-white"
                          }`}
                          onKeyPress={(e) => e.key === "Enter" && saveEdit()}
                        />
                        <button
                          onClick={saveEdit}
                          className="text-green-500 hover:text-green-600"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-500 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span
                          className={`flex-1 ${
                            !option.active ? "line-through" : ""
                          }`}
                        >
                          {option.text}
                        </span>
                        <button
                          onClick={() => startEdit(option)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => deleteOption(option.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`${
                darkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl p-6 shadow-lg`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Results History ({results.length})
                </h2>
                <button
                  onClick={clearResults}
                  disabled={results.length === 0}
                  className="text-red-500 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {results.length === 0 ? (
                  <p
                    className={`text-center ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    } py-8`}
                  >
                    No results yet. Start spinning!
                  </p>
                ) : (
                  results
                    .slice()
                    .reverse()
                    .map((result, index) => (
                      <div
                        key={result.timestamp}
                        className={`p-3 rounded-lg ${
                          darkMode ? "bg-gray-700" : "bg-gray-50"
                        } flex items-center justify-between`}
                      >
                        <span className="font-medium">
                          {results.length - index}{")"} ⪼
                        </span>
                        <span className="flex-1 mx-10 font-bold">{result.text}</span>
                        {/* <span className="text-sm opacity-75">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span> */}
                      </div>
                    ))
                )}
              </div>

              {options.filter((opt) => opt.active).length === 0 &&
                options.length > 0 && (
                  <div
                    className={`mt-4 p-4 rounded-lg ${
                      darkMode
                        ? "bg-green-900 border-green-700"
                        : "bg-green-100 border-green-300"
                    } border-2 text-center`}
                  >
                    <h3 className="font-bold mb-2">🎊 All Done! 🎊</h3>
                    <p className="text-sm">All options have been selected!</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={hideConfirmationModal}
        onConfirm={modalState.onConfirm}
        title="Confirm Action"
        darkMode={darkMode}
      >
        <p>{modalState.message}</p>
      </ConfirmationModal>
    </div>
  );
};

export default LuckySpinner;
