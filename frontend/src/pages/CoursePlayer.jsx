import React, { useEffect, useState, useRef } from "react";
import {
  Play,
  Pause,
  Check,
  ChevronLeft,
  Clock,
  Volume2,
  Maximize2,
  Settings,
  ChevronDown,
  Send,
  Sparkles,
  Bot,
  BookCopy,
  SquareCheckBig,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Plyr from "plyr";
import "plyr/dist/plyr.css";

import axios from "axios";
import ReactPlayer from "react-player";
import { fetchTranscript } from "youtube-transcript-plus";

const CoursePlayer = () => {
  const [data, setData] = useState([]);
  const { name, id } = useParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "system",
      content:
        "Hello! I'm your AI learning assistant. I'm watching this video with you. Ask me anything about the content!",
    },
  ]);
  const [currDuration, setCurrDuration] = useState(0);
  const videoRef = useRef(null); // this means this - {current: null}:  useRef gives you an object that looks like this: { current: initialValue }. This object stays the same for the entire life of the component.
  // const plyrRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [currVideo, setCurrVideo] = useState("");

  const [vidProgress, setVidProgress] = useState({});

  const [input, setInput] = useState("");
  const chatContainerRef = useRef(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [completedVideos, setCompletedVideos] = useState([-1]);

  const getData = async () => {
    try {
      const apiData = await axios.get(
        `http://localhost:3000/course/data/${id.split("}")[0]}`
      );
      // console.log(apiData.data);
      setData(apiData.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      getData();
  }, []);

  useEffect(() => {
    if (data.length > 0){
      const currIndex = localStorage.getItem(`last_video_played_${data?.[activeIndex]?.playlist}`) || 0
      console.log(localStorage.getItem(`last_video_played_${data?.[activeIndex]?.playlist}`))
      setActiveIndex(parseFloat(currIndex));
    }
  }, [data]);


  const setActive = (index) => {
    setActiveIndex(index);
    // console.log(activeIndex);
  };

  useEffect(() => {
    //auto scroll chatbox
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isChatLoading]);

  const handleInput = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isChatLoading) {
      // const newMessages = [...messages, {
      // role: "user",
      // content: input
      // }] //spread operator to it doesnt create reference to original messages array and ui updates auto (dont use this as state isnt updated synchronously)

      // Use the functional update form with the previous state --- impppp
      setMessages((prev) => [
        ...prev, //use of spread operator in this
        {
          role: "user",
          content: input,
        },
      ]);
      setInput("");

      setIsChatLoading(true);

      try {
        const start = currentTime > 25 ? Math.floor(currentTime) - 25 : 0;
        const end = Math.floor(currentTime) + 25;

        const resp = await axios.post("http://localhost:3000/course/ai", {
          messages: [
            ...messages,
            {
              role: "user",
              content: input,
            },
          ].slice(-6),
          videoId: data?.[activeIndex]?.videoId,
          start,
          end,
          currentQues: {
            role: "user",
            content: input,
          },
        });

        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content: resp.data,
          },
        ]);
      } catch (error) {
        console.error(error);
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content: "Sorry, I'm having trouble connecting right now.",
          },
        ]);
      } finally {
        setIsChatLoading(false);
      }
    }
  };

        // console.log(Math.floor((currentTime/currDuration)*100));


  useEffect(() => {
    setMessages([
      {
        role: "system",
        content:
          "Hello! I'm your AI learning assistant. I'm watching this video with you. Ask me anything about the content!",
      },
    ]);
  }, [activeIndex]);

  const currentVideoId = data?.[activeIndex]?.videoId;

  useEffect(() => {
    const player = new Plyr(videoRef.current, {
      //this videoRef.current injects this player into the div tag where it is referrenced to
      controls: [
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "settings",
        "fullscreen",
      ],
      loop: { active: false },
      youtube: {
        noCookie: true,
        iv_load_policy: 3,
      },
      ratio: "16:9",
    });

    // plyrRef.current = player;

    player.on("ready", (event) => {
      
      if(!JSON.parse(localStorage.getItem(`video_${currentVideoId}_progress`))){
          const obj = JSON.stringify({
            progressTime: 0,
            duration: player.duration,
            completed: false
          })
          localStorage.setItem(`video_${currentVideoId}_progress`, obj );
          const progressedTime = 0;
          // console.log(progressedTime);
          event.detail.plyr.currentTime = parseFloat(progressedTime); // this parseFloat is required to convert string to number -- impp
          setCurrDuration(player.duration);
          setCurrVideo(activeIndex);
          localStorage.setItem(`last_video_played_${data?.[activeIndex]?.playlist}`, activeIndex);
      }
      else{
        const progressedTime = JSON.parse(localStorage.getItem(`video_${currentVideoId}_progress`)).progressTime || 0;
        // console.log(progressedTime);
        event.detail.plyr.currentTime = parseFloat(progressedTime); // this parseFloat is required to convert string to number -- impp
        setCurrDuration(player.duration);
        setCurrVideo(activeIndex);
        localStorage.setItem(`last_video_played_${data?.[activeIndex]?.playlist}`, activeIndex);
        // console.log(player.duration)
        // const newCompletedVideos = [...completedVideos].filter(
        //   (num) => num !== activeIndex
        // );
        // setCompletedVideos(newCompletedVideos);
        // const compVids = JSON.stringify(newCompletedVideos);
        // localStorage.setItem(`completed_videos`, compVids);
      }
      
    });
    player.on("timeupdate", (event) => {
      //simple event listener when currentTime attribute of player updates
      const time = event.detail.plyr.currentTime;
      setCurrentTime(time);
      if(JSON.parse(localStorage.getItem(`video_${currentVideoId}_progress`))){
          if(JSON.parse(localStorage.getItem(`video_${currentVideoId}_progress`)).completed !== true){
          if (time > 1) {
          const progressTime = Math.floor(time);
          const obj = JSON.stringify({
            progressTime,
            duration: player.duration,
            completed: false
          })
          localStorage.setItem(`video_${currentVideoId}_progress`, obj );
        };
        }
      }
      
      
    });
    player.on("seeked", (event) => {
      const time = event.detail.plyr.currentTime;
      setCurrentTime(time);
      if(JSON.parse(localStorage.getItem(`video_${currentVideoId}_progress`))){
          if(JSON.parse(localStorage.getItem(`video_${currentVideoId}_progress`)).completed !== true){
          if (time > 1) {
          const progressTime = Math.floor(time);
          const obj = JSON.stringify({
            progressTime,
            duration: player.duration,
            completed: false
          })
          localStorage.setItem(`video_${currentVideoId}_progress`, obj );
        };
        }
      }
    });
    player.on("ended", (event) => {
      const time = event.detail.plyr.currentTime;
      setCurrentTime(time);
      if(JSON.parse(localStorage.getItem(`video_${currentVideoId}_progress`))){
          if(JSON.parse(localStorage.getItem(`video_${currentVideoId}_progress`)).completed !== true){
          if (time > 1) {
          const progressTime = Math.floor(time);
          const obj = JSON.stringify({
            progressTime: player.duration,
            duration: player.duration,
            completed: true
          })
          localStorage.setItem(`video_${currentVideoId}_progress`, obj );
        };
        }
      }
      const completedVids = JSON.parse(localStorage.getItem(`completed_videos_${data?.[activeIndex]?.playlist}`)) || [-1,];
      if(completedVids.filter((num) => num ===activeIndex).length === 0){
        const compVids = JSON.stringify([...completedVids, activeIndex]);
        setCompletedVideos((prev) => [...prev, activeIndex]);
        // const compVids = JSON.stringify([...completedVideos, activeIndex]);
        localStorage.setItem(`completed_videos_${data?.[activeIndex]?.playlist}`, compVids);
      }
      // if(activeIndex !== data?.length){
      //   setInterval(() => {
      //     setActiveIndex((prev) => prev+1);
      //   },3000)
      // }
      // event.detail.plyr.stop();
    });
  }, [currentVideoId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen  selection:bg-[#2563EB] selection:text-black overflow-hidden relative">
        <div
          className="absolute inset-0 z-0 animate-grid"
          style={{
            backgroundColor: "#0a0a0a",
            backgroundImage: `
      radial-gradient(circle at 25% 25%, #222222 0.5px, transparent 1px),
      radial-gradient(circle at 75% 75%, #111111 0.5px, transparent 1px)
    `,
            backgroundSize: "10px 10px",
            imageRendering: "pixelated",
          }}
        />
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
    <div className="min-h-screen  selection:bg-[#2563EB] selection:text-black text-white overflow-hidden relative flex flex-col">
      <style>{`
        /* Width */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        /* Track */
        ::-webkit-scrollbar-track {
          background: black;
          border-radius: 4px;
        }
        /* Handle */
        ::-webkit-scrollbar-thumb {
          background: #27272a; /* Zinc-800 */
          border-radius: 4px;
          transition: background 0.3s ease;
        }
      `}</style>

      <div
        className="absolute inset-0 z-0 animate-grid"
        style={{
          backgroundColor: "#0a0a0a",
          backgroundImage: `
      radial-gradient(circle at 25% 25%, #222222 0.5px, transparent 1px),
      radial-gradient(circle at 75% 75%, #111111 0.5px, transparent 1px)
    `,
          backgroundSize: "10px 10px",
          imageRendering: "pixelated",
        }}
      />

      {/* --- CONTENT WRAPPER --- */}
      <div className="relative z-10 max-w-450 mx-auto p-4 md:p-4 flex flex-col w-full">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-4">
            <Link
              to="/courses"
              className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5 backdrop-blur-md group"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-400 group-hover:text-white" />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white/90">
                {name}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
                <p className="text-xs text-zinc-400 font-medium tracking-wide uppercase">
                  Episode {activeIndex + 1}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN LAYOUT */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6 min-h-0 pb-2 ">
          {/* LEFT: PLAYER & DESCRIPTION */}
          <div className="lg:col-span-8 flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar">
            {/* --- VIDEO CONTAINER --- */}
            {/* key={currentVideoId} is the magic fix. It destroys the DOM when video changes */}
            <div
              key={currentVideoId}
              className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl shrink-0"
            >
              <div
                ref={videoRef}
                className="plyr__video-embed w-full h-full"
                data-plyr-provider="youtube"
                data-plyr-embed-id={currentVideoId}
              />
            </div>

            <div className="md:mt-4 mt-6 ml-2">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 ">
                {data[activeIndex].title}
              </h2>
              <h2 className="text-lg md:text-sm font-bold text-zinc-500">
                By: {data[activeIndex].channelTitle}
              </h2>
              <p className="text-zinc-400 leading-relaxed text-sm md:text-base max-w-4xl hidden ">
                {data[activeIndex].description}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: PLAYLIST + CHAT */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {/* 1. COURSE CONTENT ACCORDION */}
            <div className="max-h-140 flex flex-col bg-[#141414]/60 backdrop-blur-xl border border-white/5 rounded-lg overflow-hidden transition-all duration-300">
              {/* Header */}
              <div
                onClick={() => setIsOpen(!isOpen)}
                className="p-5 border-b border-white/5 flex justify-between items-center bg-white/2 shrink-0 cursor-pointer group/header hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                    Course Content
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-zinc-500 transition-transform duration-500 ease-in-out ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </div>
                <span className="text-[11px] font-bold text-zinc-400">
                  {JSON.parse(localStorage.getItem(`completed_videos_${data?.[activeIndex]?.playlist}`))?.length ? JSON.parse(localStorage.getItem(`completed_videos_${data?.[activeIndex]?.playlist}`))?.length -1 :'0'} / {data.length} Completed
                </span>
              </div>

              {/* Body */}
              <div
                className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden ">
                  {/* Scrollable Area */}
                  <div className="p-3 md:pb-20 space-y-2 max-h-90 md:max-h-150 overflow-y-auto custom-scrollbar hover:pr-2">
                    {data.map((video, index) => (
                      <div
                        onClick={() => {
                          setActive(index);
                        }}
                        key={index}
                        className={`
                group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer border
                ${
                  activeIndex === index
                    ? "bg-[#2563EB]/5 border-[#2563EB]/20"
                    : "bg-transparent border-transparent hover:bg-white/5"
                }
              `}
                        //  : `${completedVideos.filter((num) => num===index).length === 0 ? 'bg-green-500/5 border-green-500/20 text-zinc-700':'bg-transparent border-transparent hover:bg-white/5' }`
                      >
                        {/* Status Icon */}
                        <div
                          className={`
                  w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-transform duration-500 
                  ${
                    activeIndex === index
                      ? "bg-[#2563EB] text-black "
                      : `bg-transparent text-zinc-700 border  ${JSON.parse(localStorage.getItem(`video_${data[index].videoId}_progress`))?.completed === true ? 'border-green-500/50':'border-white/5'}`
                  }
                  
                `}
                        >
                          {activeIndex === index ? (
                            <Play size={14} fill="black" />
                          ) : (
                            <span className="text-[10px] font-bold ">
                              {JSON.parse(localStorage.getItem(`video_${data[index].videoId}_progress`))?.completed === true ? <div className="text-green-500"><SquareCheckBig size={14} /></div>: index + 1 }
                            </span>
                          )}
                        </div>

                        {/* Video Thumbnail */}
                        <div className="shrink-0 relative rounded-md overflow-hidden border border-white/10 w-20 h-11 bg-zinc-900">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
                          />
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`text-sm font-bold mb-1 leading-tight truncate ${
                              activeIndex === index
                                ? "text-white"
                                : "text-zinc-400 group-hover:text-zinc-200"
                            }`}
                          >
                            {video.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Clock
                              size={10}
                              className={
                                activeIndex === index
                                  ? "text-[#2563EB]"
                                  : "text-zinc-600"
                              }
                            />
                            <span
                              className={`text-[11px] font-medium ${
                                activeIndex === index
                                  ? "text-[#2563EB]"
                                  : "text-zinc-600"
                              }`}
                            >
                              {video.duration
                                .replace("PT", "")
                                .replace("H", ":")
                                .replace("M", ":")
                                .replace("S", "")}
                            </span>
                            
                          </div>
                          <div className="flex gap-2">
                            <div className={`${JSON.parse(localStorage.getItem(`video_${data[index].videoId}_progress`))?.progressTime ? '':'hidden'} w-full h-1 bg-zinc-800/50 rounded-full mt-2 overflow-hidden`}>
                              <div
                                className={`h-full ${JSON.parse(localStorage.getItem(`video_${data[index].videoId}_progress`))?.completed === true ? 'bg-green-500':'bg-[#2563EB]'}  rounded-full opacity-80`}
                                style={{ width: `${(JSON.parse(localStorage.getItem(`video_${data[index].videoId}_progress`))?.progressTime /JSON.parse(localStorage.getItem(`video_${data[index].videoId}_progress`))?.duration)*100}%` }}
                              ></div>
                            </div>
                            <span
                              className={`text-[11px] font-medium ${
                                activeIndex === index
                                  ? "text-[#2563EB]"
                                  : "text-zinc-600"
                              }
                              ${JSON.parse(localStorage.getItem(`video_${data[index].videoId}_progress`))?.progressTime ? '':'hidden'}
                              `}
                            >
                              {`${Math.floor((JSON.parse(localStorage.getItem(`video_${data[index].videoId}_progress`))?.progressTime/JSON.parse(localStorage.getItem(`video_${data[index].videoId}_progress`))?.duration)*100)}%`}
                            </span>
                          </div>
                          
                        </div>
                      </div>
                    ))}

                    <div className="sticky bottom-0 h-8 bg-linear-to-t from-[#141414] to-transparent pointer-events-none z-10 -mb-3"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. AI TUTOR CHAT (New Card) */}
            <div className="h-fit flex flex-col bg-[#141414]/60 backdrop-blur-xl border border-white/5 rounded-lg overflow-hidden transition-all duration-300">
              {/* Header */}
              <div
                onClick={() => setIsOpen(!isOpen)}
                className="p-5 border-b border-white/5 flex justify-between items-center bg-white/2 shrink-0 cursor-pointer group/header hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <BookCopy
                      size={15}
                      className={!isOpen ? "text-blue-500" : "text-zinc-500"}
                    />
                    AI Tutor
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-zinc-500 transition-transform duration-500 ease-in-out ${
                      !isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${
                    !isOpen ? "bg-blue-600 animate-pulse" : "bg-zinc-700"
                  }`}
                />
              </div>

              {/* Body */}
              <div
                className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
                  !isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col h-125 md:max-h-150 relative">
                    {/* Chat Messages Area */}
                    <div
                      ref={chatContainerRef}
                      className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
                    >
                      {/* AI Welcome Message */}
                      {messages.map((item, id) => (
                        <div key={id}>
                          {item.role === "system" ? (
                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                                <Bot size={14} className="text-blue-400" />
                              </div>
                              <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-3 text-sm text-zinc-300 leading-relaxed">
                                <p>{item.content}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-3 flex-row-reverse">
                              <div className="bg-[#2563EB] rounded-2xl rounded-tr-none p-3 text-sm text-white leading-relaxed max-w-[85%]">
                                <p>{item.content}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* loading shoudnt be in messages.map as it has to be the latest/last msg to appear thus at the end */}
                      {isChatLoading && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                            <Bot
                              size={14}
                              className="text-blue-400 animate-pulse"
                            />
                          </div>
                          <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-3 text-sm text-zinc-300 leading-relaxed max-w-25">
                            <div className="flex gap-1 items-center h-full justify-center">
                              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSubmit}>
                      <div className="p-3 border-t border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md mt-auto">
                        <div className="relative">
                          <input
                            type="text"
                            value={input}
                            onChange={handleInput}
                            autoComplete="off"
                            name="user_text"
                            placeholder="Ask a question..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-zinc-600"
                          />
                          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-blue-500 rounded-lg text-zinc-400 hover:text-white transition-all">
                            <Send size={14} />
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
