import React, { useEffect, useState } from "react";
import { 
  Play, 
  Pause, 
  Check, 
  ChevronLeft, 
  Clock, 
  Volume2,
  Maximize2,
  Settings
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import ReactPlayer from 'react-player'

const CoursePlayer = () => {
  
  const [data, setData] = useState([])

  const {name,id} = useParams()

  const [activeIndex, setActiveIndex] = useState(0)

  const getData = async () => {

    const apiData = await axios.get(`http://localhost:3000/course/data/${id.split('}')[0]}`);
    console.log(apiData.data);
    setData(apiData.data);

  }

  useEffect(() => {
    getData();
  },[])

  const setActive = (index) => {
    setActiveIndex(index)
    console.log(activeIndex)
  }


  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans selection:bg-[#DEFF0A] selection:text-black text-white overflow-hidden relative flex flex-col">
      
      {/* --- CSS FOR CUSTOM SCROLLBAR --- */}
      <style>{`
        /* Width */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        /* Track */
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        /* Handle */
        ::-webkit-scrollbar-thumb {
          background: #27272a; /* Zinc-800 */
          border-radius: 4px;
          transition: background 0.3s ease;
        }
        /* Handle on hover */
        ::-webkit-scrollbar-thumb:hover {
          background: #DEFF0A; /* Neon Glow */
        }
      `}</style>

      {/* --- BACKGROUND FX --- */}
      <div className="absolute top-[-20%] left-[-10%] w-200 h-200 bg-[#DEFF0A] rounded-full blur-[180px] opacity-[0.06] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-150 h-150 bg-[#7000FF] rounded-full blur-[180px] opacity-[0.06] pointer-events-none mix-blend-screen"></div>
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='6.29' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* --- CONTENT WRAPPER --- */}
      <div className="relative z-10 max-w-450 mx-auto p-4 md:p-4 flex flex-col w-full">
        
        {/* HEADER */}
        <header className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-4">
            <Link 
              to="/courses" 
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5 backdrop-blur-md group"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-400 group-hover:text-white" />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white/90">
                {name}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DEFF0A]"></span>
                <p className="text-xs text-zinc-400 font-medium tracking-wide uppercase">
                  Episode {activeIndex}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN LAYOUT */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-0 pb-2 ">
          
          {/* LEFT: PLAYER & DESCRIPTION */}
          <div className="lg:col-span-8 flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar">
            
            
            {/* Video Player Container */}
            <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl shrink-0 group">
  
  <iframe 
    className="absolute top-0 left-0 w-full h-full"
    // FIX: Changed 'watch?v=' to 'embed/' and removed the first '?' since it's part of the path now
    src={`https://www.youtube.com/embed/${data?.[activeIndex]?.videoId}?autoplay=0&mute=1&controls=1&rel=0&modestbranding=1&showinfo=0`}
    title="YouTube video player" 
    frameBorder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowFullScreen
  ></iframe>

  {/* Custom Overlay */}
  <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-3xl shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
</div>

            {/* Meta Data */}
            <div className="md:mt-4 mt-6 ml-2">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 ">{data?.[activeIndex]?.title}</h2>
              <h2 className="text-lg md:text-sm font-bold text-zinc-500">By: {data?.[activeIndex]?.channelTitle}</h2>
              <p className="text-zinc-400 leading-relaxed text-sm md:text-base max-w-4xl hidden ">
                {data?.[activeIndex]?.description}
              </p>
            </div>
          </div>
          
          {/* RIGHT: PLAYLIST WITH THUMBNAILS */}
          <div className="h-fit md:max-h-150 max-h-90 lg:col-span-4 flex flex-col bg-[#141414]/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden">
            
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/2 shrink-0">
              <span className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">Course Content</span>
              <span className="text-[11px] font-bold text-zinc-600">{activeIndex} / {data.length} Completed</span>
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar hover:pr-2 transition-all ">
              {data.map((video, index) => (
                <div 
                  onClick={() => {
                    setActive(index);
                  }}
                  key={index}
                  className={`
                    group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer border
                    ${activeIndex === index 
                      ? 'bg-[#DEFF0A]/5 border-[#DEFF0A]/20' 
                      : 'bg-transparent border-transparent hover:bg-white/5'
                    }
                  `}
                >
                  {/* 1. Status Indicator Icon */}
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-500 
                    ${activeIndex === index ? 'bg-[#DEFF0A] text-black shadow-[0_0_10px_rgba(222,255,10,0.2)]' : 'bg-transparent text-zinc-700 border border-white/5'}
              
                  `}
                  >
                    {activeIndex === index ?  <Play size={14} fill="black" /> : <span className="text-[10px] font-bold ">{index + 1}</span>}
                  </div>

                  {/* 2. NEW: Video Thumbnail */}
                  <div className="shrink-0 relative rounded-lg overflow-hidden border border-white/10 w-20 h-11 bg-zinc-900">
                    <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
                    />
                    {video.status === 'locked' && <div className="absolute inset-0 bg-black/50"></div>}
                  </div>

                  {/* 3. Text Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold mb-1 leading-tight truncate ${video.status === 'active' ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                      {video.title}
                    </h4>
                    <div className="flex items-center gap-2">
                       <Clock size={10} className={video.status === 'active' ? 'text-[#DEFF0A]' : 'text-zinc-600'} />
                       <span className={`text-[11px] font-medium ${video.status === 'active' ? 'text-[#DEFF0A]' : 'text-zinc-600'}`}>
                         {video.duration.replace("PT","").replace("H",":").replace("M",":").replace("S","")}
                       </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Fade */}
            <div className="h-8 bg-linear-to-t from-[#141414] to-transparent pointer-events-none shrink-0 z-10 -mt-8"></div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;