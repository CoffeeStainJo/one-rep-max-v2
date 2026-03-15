import React, { useState, useEffect, useMemo } from 'react';

export default function OneRepMaxCalc() {
  // States initialized with user defaults
  const [weightStr, setWeightStr] = useState('92.5');
  const [repsStr, setRepsStr] = useState('5');
  const [formula, setFormula] = useState('brzycki');

  // Helper to parse comma or dot decimals
  const parseDecimal = (val) => {
    if (!val) return 0;
    const normalized = val.replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleWeightChange = (e) => {
    // Allow numbers, dots, and commas
    const val = e.target.value.replace(/[^0-9.,]/g, '');
    setWeightStr(val);
  };

  const handleRepsChange = (e) => {
    const val = e.target.value.replace(/[^0-9.,]/g, '');
    setRepsStr(val);
  };

  const weight = parseDecimal(weightStr);
  const reps = parseDecimal(repsStr);

  // Calculate 1RM instantly when dependencies change
  const oneRM = useMemo(() => {
    if (weight <= 0 || reps <= 0) return 0;
    if (reps === 1) return weight;

    let result = 0;
    switch (formula) {
      case 'epley':
        result = weight * (1 + reps / 30);
        break;
      case 'mayhew':
        result = (weight * 100) / (52.2 + 41.9 * Math.exp(-0.055 * reps));
        break;
      case 'lombardi':
        result = weight * Math.pow(reps, 0.1);
        break;
      case 'brzycki':
      default:
        // Brzycki breaks down at 37+ reps, default to standard weight if they push it that far
        result = reps >= 37 ? weight : weight * (36 / (37 - reps));
        break;
    }
    return result;
  }, [weight, reps, formula]);

  // Percentage table mapping
  const percentages = [
    { percent: 100, expectedReps: 1 },
    { percent: 95, expectedReps: 2 },
    { percent: 90, expectedReps: 4 },
    { percent: 85, expectedReps: 6 },
    { percent: 80, expectedReps: 8 },
    { percent: 75, expectedReps: 10 },
    { percent: 70, expectedReps: 12 },
    { percent: 65, expectedReps: 16 },
    { percent: 60, expectedReps: 20 },
    { percent: 55, expectedReps: 24 },
    { percent: 50, expectedReps: 30 },
  ];

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, notify user
                if (confirm('New version available! Would you like to update?')) {
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch(error => console.log('Service worker registration failed:', error));
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0D14] text-gray-100 font-sans selection:bg-indigo-500 selection:text-white flex justify-center pb-12">
      {/* Container optimized for iPhone 14 Pro width (~390px-430px) */}
      <div className="w-full max-w-[430px] p-5 flex flex-col gap-6">

        {/* Header Section */}
        <div className="text-center pt-8 pb-4">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            1RM Calculator
          </h1>
          <p className="text-gray-400 text-sm mt-1">Discover your true strength</p>
        </div>

        {/* 1RM Display Card */}
        <div className="relative bg-[#131824] rounded-3xl p-6 border border-white/5 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500"></div>
          <span className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-2">Estimated 1RM</span>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black tabular-nums text-white">
              {oneRM > 0 ? oneRM.toFixed(1) : '0.0'}
            </span>
            <span className="text-xl text-indigo-400 font-bold">kg</span>
          </div>
        </div>

        {/* Inputs Section */}
        <div className="bg-[#131824] rounded-3xl p-6 border border-white/5 flex flex-col gap-6">

          {/* Weight Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-300">Lift Weight (kg)</label>
            <input
              type="text"
              inputMode="decimal"
              value={weightStr}
              onChange={handleWeightChange}
              className="w-full bg-[#0A0D14] text-2xl font-bold rounded-2xl p-4 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all tabular-nums"
              placeholder="e.g. 92,5"
            />
          </div>

          {/* Reps Input & Slider */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <label className="text-sm font-semibold text-gray-300">Repetitions</label>
              <input
                type="text"
                inputMode="decimal"
                value={repsStr}
                onChange={handleRepsChange}
                className="w-20 bg-[#0A0D14] text-xl font-bold rounded-xl py-2 px-3 text-center border border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all tabular-nums"
              />
            </div>

            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={reps || 1}
              onChange={(e) => setRepsStr(e.target.value)}
              className="w-full accent-cyan-400 h-2 bg-[#0A0D14] rounded-lg appearance-none cursor-pointer"
            />

            {/* Quick Select Buttons */}
            <div className="flex justify-between gap-2 mt-2">
              {[3, 5, 8, 10, 12].map((r) => (
                <button
                  key={r}
                  onClick={() => setRepsStr(r.toString())}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${reps === r
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                    : 'bg-[#0A0D14] text-gray-400 border border-white/5 hover:bg-white/5'
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Formula Selector */}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
            <label className="text-sm font-semibold text-gray-300">Calculation Formula</label>
            <select
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              className="w-full bg-[#0A0D14] text-md font-medium text-gray-200 rounded-2xl p-4 border border-white/10 focus:border-indigo-500 outline-none appearance-none"
            >
              <option value="brzycki">Brzycki (Default)</option>
              <option value="epley">Epley</option>
              <option value="mayhew">Mayhew et al.</option>
              <option value="lombardi">Lombardi</option>
            </select>
          </div>
        </div>

        {/* Visualized Percentage Table */}
        <div className="bg-[#131824] rounded-3xl p-6 border border-white/5 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-white mb-2">Percentage Table</h2>

          <div className="grid grid-cols-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
            <span className="text-left">% 1RM</span>
            <span className="text-center">Weight</span>
            <span className="text-right">Reps</span>
          </div>

          <div className="flex flex-col gap-3">
            {percentages.map((row) => {
              const rowWeight = oneRM * (row.percent / 100);
              return (
                <div key={row.percent} className="relative w-full bg-[#0A0D14] rounded-xl h-12 flex items-center overflow-hidden border border-white/5">
                  {/* Progress Bar Background */}
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 transition-all duration-500 ease-out"
                    style={{ width: `${row.percent}%` }}
                  />

                  {/* Content overlay */}
                  <div className="relative z-10 w-full grid grid-cols-3 px-4 items-center">
                    <span className={`text-sm font-bold ${row.percent === 100 ? 'text-cyan-400' : 'text-gray-300'}`}>
                      {row.percent}%
                    </span>
                    <span className="text-center text-sm font-medium tabular-nums text-white">
                      {rowWeight > 0 ? rowWeight.toFixed(1) : '0.0'} kg
                    </span>
                    <span className="text-right text-sm font-medium text-gray-400">
                      {row.expectedReps}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}