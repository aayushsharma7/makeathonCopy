import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftToLine } from 'lucide-react';

const CreateCourse = () => {

    

  const [playlist, setPlaylist] = useState("");
  const [owner, setOwner] = useState("");
  const [title, setTitle] = useState("");
  const [formData, setFormData] = useState({});
  const [statusCode, setStatusCode] = useState({});
  const navigate = useNavigate();

  const playlistHandle = (e) => {
    setPlaylist(e.target.value);
  };
  const ownerHandle = (e) => {
    setOwner(e.target.value);
  };
  const titleHandle = (e) => {
    setTitle(e.target.value);
  };

  const backendResponse = async (payload) => {
    try {
      const responsePost = await axios.post(
        "http://localhost:3000/course",
        payload
      );
      // console.log(responsePost.status);
      return responsePost;
    } catch (error) {
      // console.log(error.status);
      return error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      url: playlist,
      name: title,
      owner,
    };
    setFormData(payload);
    const res = await backendResponse(payload);
    if (res.status === 409) {
      console.log(res.response.data);
      setStatusCode({
        code: res.status,
        data: res.response.data,
      });

    } else if (res.status === 200) {
      console.log(res.data);
      setStatusCode({
        code: res.status,
        data: res.data,
      });
      navigate('/courses')
    }

  };

  return (
    <div className="min-h-screen h-fit flex items-center justify-center bg-[#0A0A0A] font-sans selection:bg-[#DEFF0A] selection:text-black overflow-hidden relative p-4">
          {/* Background Ambient Glows */}
          <div className="absolute top-[-20%] left-[-10%] w-150 h-150 bg-[#DEFF0A] rounded-full blur-[180px] opacity-[0.15] pointer-events-none mix-blend-screen"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-125 h-125 bg-[#7000FF] rounded-full blur-[180px] opacity-[0.12] pointer-events-none mix-blend-screen"></div>
          <div className="absolute top-[40%] left-[60%] w-75 h-75 bg-[#00E0FF] rounded-full blur-[150px] opacity-[0.08] pointer-events-none mix-blend-screen"></div>
          {/* Noise Texture */}
          <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='6.29' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
          <div className="w-full md:max-w-135 relative z-10">
      {/* Decorative Elements */}
      {/* Main Card */}
      <div className="md:mt-0 -mt-20 bg-[#141414]/90 backdrop-blur-xl rounded-[36px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] border border-white/10 p-8 md:p-10 overflow-hidden relative">
        {/* Header */}
        <div className="mb-10 relative">
          <div className="absolute -top-6 -left-6 w-12 h-12 bg-[#DEFF0A] blur-2xl opacity-40"></div>
          <div className="flex items-center justify-between">
            <span className="inline-block py-1 px-3 rounded-full bg-zinc-800/50 border border-white/5 text-xs font-bold text-[#DEFF0A] uppercase tracking-widest mb-4">
                Open-Course
            </span>
            <Link to={'/courses'}>
            <span className="py-1 px-3 rounded-full text-[14px] font-bold text-zinc-400 tracking-widest mb-4 flex gap-1 items-center">
                {/* div<ArrowLeftToLine  strokeWidth={1} absoluteStrokeWidth /> */}
                <ArrowLeftToLine size={14} />
                Home
            </span>
            </Link>
          </div>
          
          
          
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-3">
            Create a course  <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#DEFF0A] to-[#ffffff]">
              in seconds!
            </span>
          </h1>
          <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-sm">
            Convert any Youtube playlist into a full fledged course. Paste the link to get started!
          </p>
        </div>

        {/* Form Inputs (Visual Only) */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Input 1: Playlist Link */}
            <div className="group relative">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-4 mb-2 block group-focus-within:text-[#DEFF0A] transition-colors">
                YouTube Playlist URL
              </label>
              <div className="relative transition-all duration-300 group-focus-within:transform group-focus-within:scale-[1.01]">
                <div className="absolute inset-0 bg-linear-to-r from-[#DEFF0A] to-[#7000FF] rounded-2xl blur-md opacity-0 group-focus-within:opacity-30 transition-opacity duration-500"></div>
                <input
                  autoComplete="off"
                  type="text"
                  placeholder="paste.your.link/here"
                  name="playlist"
                  value={playlist}
                  onChange={playlistHandle}
                  required
                  className="relative w-full bg-[#1A1A1A] text-white text-[15px] font-medium px-5 py-4 rounded-2xl border border-zinc-800 placeholder:text-zinc-600 focus:outline-none focus:border-[#DEFF0A] focus:bg-[#202020] focus:shadow-[0_0_20px_rgba(222,255,10,0.1)] transition-all duration-300"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none group-focus-within:text-[#DEFF0A] transition-colors duration-300">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19.485 4.515a4 4 0 010 5.656l-1.101 1.102a4 4 0 11-5.656-5.656l4-4a4 4 0 015.656 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Input 2: Course Name */}
            <div className="group relative">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-4 mb-2 block group-focus-within:text-[#DEFF0A] transition-colors">
                Course Title
              </label>
              <div className="relative transition-all duration-300 group-focus-within:transform group-focus-within:scale-[1.01]">
                <div className="absolute inset-0 bg-linear-to-r from-[#DEFF0A] to-[#7000FF] rounded-2xl blur-md opacity-0 group-focus-within:opacity-30 transition-opacity duration-500"></div>
                <input
                  autoComplete="off"
                  type="text"
                  placeholder="e.g. Neon Patterns Advanced"
                  name="title"
                  value={title}
                  onChange={titleHandle}
                  required
                  className="relative w-full bg-[#1A1A1A] text-white text-[15px] font-medium px-5 py-4 rounded-2xl border border-zinc-800 placeholder:text-zinc-600 focus:outline-none focus:border-[#DEFF0A] focus:bg-[#202020] focus:shadow-[0_0_20px_rgba(222,255,10,0.1)] transition-all duration-300"
                />
              </div>
            </div>

            {/* Input 3: Owner Name */}
            <div className="group relative">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-4 mb-2 block group-focus-within:text-[#DEFF0A] transition-colors">
                User
              </label>
              <div className="relative transition-all duration-300 group-focus-within:transform group-focus-within:scale-[1.01]">
                <div className="absolute inset-0 bg-linear-to-r from-[#DEFF0A] to-[#7000FF] rounded-2xl blur-md opacity-0 group-focus-within:opacity-30 transition-opacity duration-500"></div>
                <input
                  autoComplete="off"
                  type="text"
                  placeholder="e.g. The Design Lead"
                  name="owner"
                  value={owner}
                  onChange={ownerHandle}
                  required
                  className="relative w-full bg-[#1A1A1A] text-white text-[15px] font-medium px-5 py-4 rounded-2xl border border-zinc-800 placeholder:text-zinc-600 focus:outline-none focus:border-[#DEFF0A] focus:bg-[#202020] focus:shadow-[0_0_20px_rgba(222,255,10,0.1)] transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Sassy Submit Button */}
          <div className="pt-10 relative group ">
            
            <button 
            className="cursor-pointer relative w-full bg-[#DEFF0A] hover:bg-[#CBEA00] active:scale-[0.98] text-black font-black text-[16px] tracking-wide py-5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden">
              <span className="relative z-10">CREATE COURSE</span>
              <svg
                className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 7L18 12L13 17"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 12H17"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <p
              className={`text-sm font-medium leading-relaxed max-w-sm mt-5 text-center ${
                !statusCode.code
                  ? "hidden"
                  : `${
                      statusCode.code === 200
                        ? "text-green-500"
                        : "text-red-500"
                    }`
              }`}
            >
              {!statusCode.code
                ? ""
                : `${statusCode.code} : ${statusCode.data}`}
            </p>
          </div>
        </form>
      </div>

      {/* Bottom Status Bar */}
      {/* <div className="mt-6 flex justify-between items-center px-6 text-xs font-bold text-zinc-600 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="block w-2 h-2 bg-zinc-800 rounded-full"></span>
          <span>Sync Ready</span>
        </div>
        <span>01 / 03</span>
      </div> */}
    </div>
          
          
        </div>
    
  );
};

export default CreateCourse;
