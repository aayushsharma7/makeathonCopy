import React from 'react'
import { BookOpen, Clock, Trophy, Settings, Share2, Flame } from 'lucide-react'
const Profile = () => {
  // Mock Data for Stats
  const stats = [
    { label: 'Courses Created', value: '12', icon: BookOpen, color: 'text-blue-400' },
    { label: 'Hours Learned', value: '48.5', icon: Clock, color: 'text-amber-400' },
    { label: 'Completion Rate', value: '85%', icon: Trophy, color: 'text-emerald-400' },
    { label: 'Current Streak', value: '7 Days', icon: Flame, color: 'text-orange-500' },
  ]

  // Mock Data for Heatmap (364 days for a full grid look)
  // 0 = empty, 1-4 = intensity levels
  const generateHeatmapData = () => {
    return Array.from({ length: 364 }, () => Math.floor(Math.random() * 5)); 
  };
  
  const heatmapData = generateHeatmapData();

  const getHeatmapColor = (level) => {
    switch (level) {
      case 1: return 'bg-blue-900/40';
      case 2: return 'bg-blue-800/60';
      case 3: return 'bg-blue-600';
      case 4: return 'bg-blue-400';
      default: return 'bg-neutral-800/50';
    }
  };

  return (
    <div className="min-h-screen selection:bg-[#2563EB] selection:text-white relative text-gray-100 font-sans overflow-hidden">

      {/* BACKGROUND LAYER */}
        <div
  className="absolute inset-0 z-0 animate-grid" // <--- Added class here
  style={{
    backgroundColor: '#0a0a0a',
    backgroundImage: `
      radial-gradient(circle at 25% 25%, #222222 0.5px, transparent 1px),
      radial-gradient(circle at 75% 75%, #111111 0.5px, transparent 1px)
    `,
    backgroundSize: '10px 10px', // The animation moves exactly this distance
    imageRendering: 'pixelated',
  }}
/>

      {/* MAIN CONTENT */}
      <div className="relative z-10  mx-auto px-4 py-20 max-w-5xl">
        
        {/* 1. USER HEADER */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            {/* Avatar */}
            <div className="h-28 w-28 rounded-full p-1 bg-gradient-to-tr from-blue-600 to-amber-600">
               <div className="h-full w-full rounded-full bg-neutral-900 border-4 border-[#0a0a0a] flex items-center justify-center overflow-hidden">
                  <span className="text-4xl font-bold text-gray-200">JD</span>
                  {/* <img src="URL_HERE" alt="user" className="h-full w-full object-cover" /> */}
               </div>
            </div>
            
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">John Doe</h1>
              <p className="text-gray-400 font-medium mb-3">Full Stack Developer • Student</p>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                 <span className="px-3 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20 font-mono">PRO MEMBER</span>
                 <span className="text-xs text-gray-500">Joined Jan 2025</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
             <button className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-gray-400 transition-all">
                <Share2 size={18} />
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 hover:border-neutral-600 transition-all text-sm text-gray-300">
                <Settings size={16} />
                Edit Profile
             </button>
          </div>
        </div>

        {/* 2. STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-sm hover:bg-neutral-800/40 transition-all flex flex-col items-center md:items-start text-center md:text-left group">
              <div className={`mb-3 p-2 rounded-lg bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
              <span className="text-3xl font-bold text-white mb-1 tracking-tight">{stat.value}</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* 3. ACTIVITY HEATMAP */}
        <div className="rounded-2xl border border-neutral-800 bg-[#0c0c0c]/80 backdrop-blur-md p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Learning Activity</h2>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-neutral-800/50"></div>
                <div className="w-3 h-3 rounded-sm bg-blue-900/40"></div>
                <div className="w-3 h-3 rounded-sm bg-blue-600"></div>
                <div className="w-3 h-3 rounded-sm bg-blue-400"></div>
              </div>
              <span>More</span>
            </div>
          </div>

          {/* The Grid Container */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[700px]">
              {/* Grid: 7 rows (days), flows column-wise */}
              <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
                {heatmapData.map((level, i) => (
                  <div 
                    key={i}
                    className={`w-3 h-3 rounded-[2px] ${getHeatmapColor(level)} hover:ring-1 hover:ring-white/50 transition-all cursor-pointer`}
                    title={`Activity Level: ${level}`}
                  />
                ))}
              </div>
              
              {/* Month Labels (Visual only) */}
              <div className="flex justify-between text-[10px] text-gray-600 font-mono mt-2 px-1">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Profile