import React, { useEffect, useState } from "react";
import {
  Plus,
  Play,
  MoreVertical,
  Clock,
  User,
  Zap,
  LogOutIcon,
  LogInIcon,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [infor, setInfor] = useState({});

  const checkAuth = async () => {
    try {
      const responsePost = await axios.get(`http://localhost:3000/auth/check`, {
        withCredentials: true,
      });
      console.log(responsePost.data);
      if (responsePost.data.code === 200) {
        setIsLoggedIn(true);
        setInfor(responsePost.data.info);
      } else {
        setIsLoggedIn(false);
        navigate("/signup");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkAuth();
  },[]);

  const getData = async () => {
    try {
      const data = await axios.get(`http://localhost:3000/course`, {
        withCredentials: true,
      });
      if (data.status === 200) {
        setCourses(data.data.reverse());
        console.log(data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      // setIsLoggedIn(true);
      // console.log(isLoggedIn)
    }
  };

  useEffect(() => {
    getData();
    console.log(courses);
  }, []);

  const navigate = useNavigate();

  const goToCourse = (e, n) => {
    navigate(`/courses/${n}/${e}}`);
  };

  

  // const changeUser = () => {
  //     setUser('changed');
  // }

  // setTimeout(() => {
  // setLoading(false);
  // },500)

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A] font-sans selection:bg-[#DEFF0A] selection:text-black overflow-hidden relative">
        <div className="absolute top-[-20%] left-[-10%] w-150 h-150 bg-[#DEFF0A] rounded-full blur-[180px] opacity-[0.15] pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-125 h-125 bg-[#7000FF] rounded-full blur-[180px] opacity-[0.12] pointer-events-none mix-blend-screen"></div>
        <div className="absolute top-[40%] left-[60%] w-75 h-75 bg-[#00E0FF] rounded-full blur-[150px] opacity-[0.08] pointer-events-none mix-blend-screen"></div>
        {/* Noise Texture */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='6.29' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        ></div>
        <div class="container">
          <div class="h1Container">
            <div class="cube h1 w1 l1">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h1 w1 l2">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h1 w1 l3">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h1 w2 l1">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h1 w2 l2">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h1 w2 l3">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h1 w3 l1">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h1 w3 l2">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h1 w3 l3">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>
          </div>

          <div class="h2Container">
            <div class="cube h2 w1 l1">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h2 w1 l2">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h2 w1 l3">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h2 w2 l1">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h2 w2 l2">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h2 w2 l3">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h2 w3 l1">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h2 w3 l2">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h2 w3 l3">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>
          </div>

          <div class="h3Container">
            <div class="cube h3 w1 l1">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h3 w1 l2">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h3 w1 l3">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h3 w2 l1">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h3 w2 l2">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h3 w2 l3">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h3 w3 l1">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h3 w3 l2">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>

            <div class="cube h3 w3 l3">
              <div class="face top"></div>
              <div class="face left"></div>
              <div class="face right"></div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans selection:bg-[#DEFF0A] selection:text-black overflow-hidden relative">
      {/* <Navbar /> */}
      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-150 h-150 bg-[#DEFF0A] rounded-full blur-[180px] opacity-[0.15] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-125 h-125 bg-[#7000FF] rounded-full blur-[180px] opacity-[0.12] pointer-events-none mix-blend-screen"></div>
      <div className="absolute top-[40%] left-[60%] w-75 h-75 bg-[#00E0FF] rounded-full blur-[150px] opacity-[0.08] pointer-events-none mix-blend-screen"></div>
      {/* Noise Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='6.29' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-22 ">
        {/* 1. HERO HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-20 ">
          <div className="relative">
            {/* Glowing Accent Dot */}
            <div className="absolute -top-10 -left-10 w-20 h-20 bg-[#DEFF0A] blur-3xl opacity-20 pointer-events-none"></div>

            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[0.9]">
              Your courses, <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#DEFF0A] via-white to-zinc-500">
                amplified.
              </span>
            </h1>
          </div>

          {/* New Ingestion Button (Styled like CreateCourse submit) */}
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight leading-[0.9]">
            Welcome,{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#DEFF0A] via-white to-zinc-500">
              {infor.username}!
            </span>
          </h1>
          {/* <Link to={`/create`} className="group relative inline-flex">
                  <button className=" relative inline-flex items-center justify-center px-8 py-4 text-base font-black text-black transition-all duration-200 bg-[#DEFF0A] font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-[#CBEA00] active:scale-[0.98]">
                    <Plus className="w-5 h-5 mr-2" strokeWidth={3} />
                    NEW COURSE
                  </button>
                </Link> */}
        </div>
        <div className="grid grid-cols-1 md:mt-0 -mt-6 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => (
            <div
              key={idx}
              className={`group ${
                courses.length > 0 ? "" : "hidden"
              } relative bg-[#141414]/60 backdrop-blur-md border border-white/5 rounded-4xl overflow-hidden hover:border-[#DEFF0A]/30 transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(222,255,10,0.1)] hover:-translate-y-1`}
            >
              {/* Card Image Area */}
              <div className="relative h-56 w-full overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-t from-[#141414] via-transparent to-transparent z-10 opacity-90"></div>
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out grayscale-[0.2] group-hover:grayscale-0"
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-14 h-14 bg-[#DEFF0A] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(222,255,10,0.4)] transform scale-50 group-hover:scale-100 transition-transform duration-300">
                    <button
                      onClick={() => {
                        goToCourse(course._id, course.title);
                      }}
                      className="cursor-pointer"
                    >
                      <Play fill="black" className="w-5 h-5 ml-1 text-black" />
                    </button>
                  </div>
                </div>

                {/* Duration Badge */}
                {/* <div className="absolute top-4 right-4 z-20">
                  <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                    <Clock size={12} className="text-[#DEFF0A]" />
                    <span className="text-[11px] font-bold text-white tracking-wide">
                      18hr
                    </span>
                  </div>
                </div> */}
              </div>

              {/* Card Content Area */}
              <div className="p-6 pt-2 relative z-20">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <h3 className="text-xl capitalize font-bold text-white leading-tight mb-1 group-hover:text-[#DEFF0A] transition-colors duration-300">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold tracking-wider uppercase">
                      <User size={12} />
                      {course.owner}
                    </div>
                  </div>
                  <button className="text-zinc-600 hover:text-white transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>

                {/* Progress Bar (Visual) */}
                {/* <div className="mt-6">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-400 mb-2 tracking-widest uppercase">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="h-1 w-full bg-zinc-800/80 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${course.progress}%` }}
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        course.progress > 0
                          ? "bg-[#DEFF0A] shadow-[0_0_10px_#DEFF0A]"
                          : "bg-zinc-700"
                      }`}
                    ></div>
                  </div>
                </div> */}

                {/* Continue/Start Link */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[13px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    Total Videos: {course.totalVideos}
                  </span>
                  <span className="text-[11px] font-black text-[#DEFF0A] tracking-wider uppercase opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    {course.progress > 0 ? "RESUME >" : "START >"}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Placeholder Card (Empty State Aesthetic) */}
          <Link
            to={`/create`}
            className="group relative border border-dashed border-zinc-800 rounded-4xl flex flex-col items-center justify-center p-6 hover:border-[#DEFF0A]/40 hover:bg-[#DEFF0A]/5 transition-all duration-300 min-h-75"
          >
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-110 group-hover:border-[#DEFF0A] transition-all duration-300">
              <Plus
                size={24}
                className="text-zinc-600 group-hover:text-[#DEFF0A]"
              />
            </div>
            <span className="mt-4 text-sm font-bold text-zinc-600 tracking-widest uppercase group-hover:text-zinc-400">
              Add New Course
            </span>
          </Link>
        </div>
       
        
        {/* Footer Status */}
        <div className="mt-20 border-t border-white/5 pt-8 flex justify-between items-center text-xs font-bold text-zinc-700 uppercase tracking-widest">
          <span>Vault v2.0</span>
          <div className="flex items-center gap-2">
            {/* <span className="w-2 h-2 bg-[#DEFF0A] rounded-full animate-pulse"></span>
            <span>System Online</span> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
