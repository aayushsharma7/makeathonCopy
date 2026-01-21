import React, { useEffect, useState, useRef, act } from "react";
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
  PencilRuler,
  Pencil,
  Trash2,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Plyr from "plyr";
import "plyr/dist/plyr.css";

import axios from "axios";
import ReactPlayer from "react-player";
import { fetchTranscript } from "youtube-transcript-plus";

const CoursePlayer = () => {
  const [data, setData] = useState([]);
  const [courseData, setCourseData] = useState({});
  const { name, id } = useParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isContentOpen, setIsContentOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCardsOpen, setIsCardsOpen] = useState(false);
  const playerInstanceRef = useRef(null); // to use the player outside the useeffect...
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
  const [notesLoading, setNotesLoading] = useState(true);

  const [videoProgress, setVideoProgress] = useState({});
  const [courseProgress, setCourseProgress] = useState({});

  const [input, setInput] = useState("");
  const chatContainerRef = useRef(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [completedVideos, setCompletedVideos] = useState([-1]);
  const [currentVideoNotes, setCurrentVideoNotes] = useState([]);
  const [notesInput, setNotesInput] = useState("");

  const getData = async () => {
    try {
      const apiData = await axios.get(
        `http://localhost:3000/course/data/${id.split("}")[0]}`,
        {
          withCredentials: true,
        }
      );
      const courseApiData = await axios.get(
        `http://localhost:3000/course/getCourse/${id.split("}")[0]}`,
        {
          withCredentials: true,
        }
      );
      const currIndex =
        localStorage.getItem(
          `last_video_played_${apiData?.data?.[activeIndex]?.playlist}`
        ) ||
        courseApiData?.data?.[0]?.lastVideoPlayed ||
        0;
      // console.log(localStorage.getItem(`last_video_played_${data?.[activeIndex]?.playlist}`))
      setActiveIndex(parseFloat(currIndex));
      // console.log(apiData.data);
      const filteredData = apiData.data.filter((e) => (e.duration !== 'PT0S'))
      setData(filteredData);
      setCourseData(courseApiData.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const getNotesData = async () => {
    try {
      const notesApiData = await axios.get(
        `http://localhost:3000/course/notes/${data?.[activeIndex]?._id}`,
        {
          withCredentials: true,
        }
      );

      setCurrentVideoNotes(notesApiData?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setNotesLoading(false);
    }
  };

  const setActive = (index) => {
    setActiveIndex(index);
    // console.log(activeIndex);
  };

  const deletNotes = async (noteId) => {
    try {
      console.log(noteId);
      // setCurrentVideoNotes((prev) => ([...prev].filter((e) => e.noteIndex !== noteIdx+1)));
      const apiRes = await axios.post(
        "http://localhost:3000/course/update/video/notes/delete",
        {
          videoId: data?.[activeIndex]?._id,
          noteId,
        },
        { withCredentials: true }
      );
      await getNotesData();
    } catch (error) {
      console.log(error);
    }
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
  const handleNotesInput = (e) => {
    setNotesInput(e.target.value);
  };

  const handleNotesSubmit = async (e) => {
    e.preventDefault();

    const apiRes = await axios.post(
      "http://localhost:3000/course/update/video/notes",
      {
        videoId: data?.[activeIndex]?._id,
        newNote: {
          videoId: data?.[activeIndex]?._id,
          timestamp:
            JSON.parse(localStorage.getItem(`video_${currentVideoId}_progress`))
              ?.progressTime ||
            data?.[activeIndex]?.progressTime ||
            0,
          notesContent: notesInput,
        },
      },
      { withCredentials: true }
    );

    await getNotesData();
    console.log(currentVideoNotes);

    // setCurrentVideoNotes((prev) => [...prev, {
    //   videoId: data?.[activeIndex]?._id,
    //   noteIndex: currentVideoNotes.length + 1 || 1,
    //   timestamp: Math.floor(playerInstanceRef.current.currentTime) || JSON.parse(localStorage.getItem(`video_${currentVideoId}_progress`))?.progressTime || data?.[activeIndex]?.progressTime || 0,
    //   notesContent: notesInput
    // }]);
    setNotesInput("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newMessages = [
      ...messages,
      {
        role: "user",
        content: input,
      },
    ];
    sessionStorage.setItem(
      `messages_${data?.[activeIndex]?._id}`,
      JSON.stringify(newMessages)
    );

    if (!isChatLoading) {
      // const newMessages = [...messages, {
      // role: "user",
      // content: input
      // }] //spread operator to it doesnt create reference to original messages array and ui updates auto (dont use this as state isnt updated synchronously)

      // Use the functional update form with the previous state --- impppp
      setMessages(newMessages);
      setInput("");

      setIsChatLoading(true);

      try {
        const start = currentTime > 60 ? Math.floor(currentTime) - 60 : 0;
        const end = Math.floor(currentTime) + 60;

        const resp = await axios.post(
          "http://localhost:3000/course/ai",
          {
            messages: newMessages.slice(-6),
            videoId: data?.[activeIndex]?.videoId,
            start,
            end,
            currentQues: {
              role: "user",
              content: input,
            },
          },
          { withCredentials: true }
        );
        const newerMessages = [
          ...newMessages,
          {
            role: "system",
            content: resp.data,
          },
        ];
        setMessages(newerMessages);
        sessionStorage.setItem(
          `messages_${data?.[activeIndex]?._id}`,
          JSON.stringify(newerMessages)
        );
      } catch (error) {
        console.error(error);
        const newerMessages = [
          ...newMessages,
          {
            role: "system",
            content: "Sorry, I'm having trouble connecting right now.",
          },
        ];
        setMessages(newerMessages);
        sessionStorage.setItem(
          `messages_${data?.[activeIndex]?._id}`,
          JSON.stringify(newerMessages)
        );
      } finally {
        setIsChatLoading(false);
      }
    }
  };

  // console.log(Math.floor((currentTime/currDuration)*100));

  // useEffect(() => {
  //   if (
  //     JSON.parse(localStorage.getItem(`messages_${data?.[activeIndex]?._id}`))
  //   ) {
  //     setMessages(
  //       JSON.parse(localStorage.getItem(`messages_${data?.[activeIndex]?._id}`))
  //     );
  //   } else {
  //     setMessages([
  //       {
  //         role: "system",
  //         content:
  //           "ho",
  //       },
  //     ]);
  //   }
  // }, [activeIndex]);

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
      playerInstanceRef.current = player;
      // if(!JSON.parse(localStorage.getItem(`video_${currentVideoId}_progress`))){
      //     const obj = JSON.stringify({
      //       progressTime: 0,
      //       duration: player.duration,
      //       completed: false
      //     })
      //     localStorage.setItem(`video_${currentVideoId}_progress`, obj );
      //     const progressedTime = 0;
      // console.log(progressedTime);
      //     event.detail.plyr.currentTime = parseFloat(progressedTime); // this parseFloat is required to convert string to number -- impp
      //     setCurrDuration(player.duration);
      //     setCurrVideo(activeIndex);
      //     localStorage.setItem(`last_video_played_${data?.[activeIndex]?.playlist}`, activeIndex);
      // }
      const progressedTime =
        JSON.parse(localStorage.getItem(`video_${currentVideoId}_progress`))
          ?.progressTime || data?.[activeIndex]?.progressTime;
      // console.log(progressedTime);
      event.detail.plyr.currentTime = parseFloat(progressedTime); // this parseFloat is required to convert string to number -- impp
      setCurrDuration(player.duration);
      setCurrVideo(activeIndex);

      localStorage.setItem(
        `last_video_played_${data?.[activeIndex]?.playlist}`,
        activeIndex
      );
      setCourseProgress({
        id: data?.[activeIndex]?.playlist,
        completedVideos:
          JSON.parse(
            localStorage.getItem(
              `completed_videos_${data?.[activeIndex]?.playlist}`
            )
          ) || courseData?.[0]?.completedVideos,
        lastVideoPlayed:
          localStorage.getItem(
            `last_video_played_${data?.[activeIndex]?.playlist}`
          ) ||
          courseData?.[0]?.lastVideoPlayed ||
          0,
      });
      // console.log(player.duration)
      // const newCompletedVideos = [...completedVideos].filter(
      //   (num) => num !== activeIndex
      // );
      // setCompletedVideos(newCompletedVideos);
      // const compVids = JSON.stringify(newCompletedVideos);
      // localStorage.setItem(`completed_videos`, compVids);
    });
    player.on("timeupdate", (event) => {
      //simple event listener when currentTime attribute of player updates
      const time = event.detail.plyr.currentTime;
      setCurrentTime(time);
      if (
        JSON.parse(localStorage.getItem(`video_${currentVideoId}_progress`))
      ) {
        if (
          JSON.parse(localStorage.getItem(`video_${currentVideoId}_progress`))
            .completed !== true
        ) {
          if (time > 1) {
            const progressTime = Math.floor(time);
            const obj = JSON.stringify({
              progressTime,
              duration: player.duration,
              completed: false,
            });
            setVideoProgress({
              id: data?.[activeIndex]?._id,
              progressTime,
              duration: player.duration,
              completed: false,
            });

            localStorage.setItem(`video_${currentVideoId}_progress`, obj);
          }
        }
      } else {
        if (data?.[activeIndex]?.completed !== true) {
          if (time > 1) {
            const progressTime = Math.floor(time);
            const obj = JSON.stringify({
              progressTime,
              duration: player.duration,
              completed: false,
            });
            setVideoProgress({
              id: data?.[activeIndex]?._id,
              progressTime,
              duration: player.duration,
              completed: false,
            });
            localStorage.setItem(`video_${currentVideoId}_progress`, obj);
          }
        }
      }
    });
    player.on("seeked", (event) => {
      const time = event.detail.plyr.currentTime;
      setCurrentTime(time);
      if (
        JSON.parse(localStorage.getItem(`video_${currentVideoId}_progress`))
      ) {
        if (
          JSON.parse(localStorage.getItem(`video_${currentVideoId}_progress`))
            .completed !== true
        ) {
          if (time > 1) {
            const progressTime = Math.floor(time);
            const obj = JSON.stringify({
              progressTime,
              duration: player.duration,
              completed: false,
            });
            setVideoProgress({
              id: data?.[activeIndex]?._id,
              progressTime,
              duration: player.duration,
              completed: false,
            });
            localStorage.setItem(`video_${currentVideoId}_progress`, obj);
          }
        }
      } else {
        if (data?.[activeIndex]?.completed !== true) {
          if (time > 1) {
            const progressTime = Math.floor(time);
            const obj = JSON.stringify({
              progressTime,
              duration: player.duration,
              completed: false,
            });
            setVideoProgress({
              id: data?.[activeIndex]?._id,
              progressTime,
              duration: player.duration,
              completed: false,
            });
            localStorage.setItem(`video_${currentVideoId}_progress`, obj);
          }
        }
      }
    });
    player.on("ended", (event) => {
      const time = event.detail.plyr.currentTime;
      setCurrentTime(time);
      if (
        JSON.parse(localStorage.getItem(`video_${currentVideoId}_progress`))
      ) {
        if (
          JSON.parse(localStorage.getItem(`video_${currentVideoId}_progress`))
            .completed !== true
        ) {
          if (time > 1) {
            const progressTime = Math.floor(time);
            const obj = JSON.stringify({
              progressTime: player.duration,
              duration: player.duration,
              completed: true,
            });
            setVideoProgress({
              id: data?.[activeIndex]?._id,
              progressTime: player.duration,
              duration: player.duration,
              completed: true,
            });

            localStorage.setItem(`video_${currentVideoId}_progress`, obj);
          }
        }
      } else {
        if (data?.[activeIndex]?.completed !== true) {
          if (time > 1) {
            const progressTime = Math.floor(time);
            const obj = JSON.stringify({
              progressTime: player.duration,
              duration: player.duration,
              completed: true,
            });
            setVideoProgress({
              id: data?.[activeIndex]?._id,
              progressTime: player.duration,
              duration: player.duration,
              completed: true,
            });
            localStorage.setItem(`video_${currentVideoId}_progress`, obj);
          }
        }
      }
      const completedVids =
        JSON.parse(
          localStorage.getItem(
            `completed_videos_${data?.[activeIndex]?.playlist}`
          )
        ) || courseData?.[0]?.completedVideos;
      if (completedVids.filter((num) => num === activeIndex).length === 0) {
        const compVids = JSON.stringify([...completedVids, activeIndex]);
        setCompletedVideos((prev) => [...prev, activeIndex]);
        // const compVids = JSON.stringify([...completedVideos, activeIndex]);

        localStorage.setItem(
          `completed_videos_${data?.[activeIndex]?.playlist}`,
          compVids
        );
        setCourseProgress({
          id: data?.[activeIndex]?.playlist,
          completedVideos:
            JSON.parse(
              localStorage.getItem(
                `completed_videos_${data?.[activeIndex]?.playlist}`
              )
            ) || courseData?.[0]?.completedVideos,
          lastVideoPlayed:
            localStorage.getItem(
              `last_video_played_${data?.[activeIndex]?.playlist}`
            ) ||
            courseData?.[0]?.lastVideoPlayed ||
            0,
        });
      }
      // if(activeIndex !== data?.length){
      //   setInterval(() => {
      //     setActiveIndex((prev) => prev+1);
      //   },3000)
      // }
      // event.detail.plyr.stop();
    });
  }, [currentVideoId]);

  // useState: When you update it, React re-renders (refreshes) the component to show the new data on the screen.
  // useRef: When you update it, React does nothing visually. It remembers the value in the background, but the screen does not change.
  const progressRef = useRef({
    courseId: courseProgress?.id,
    videoId: videoProgress?.id,
    completedVideos: courseProgress?.completedVideos,
    lastVideoPlayed: courseProgress?.lastVideoPlayed,
    progressTime: videoProgress?.progressTime,
    duration: videoProgress?.duration,
    completed: videoProgress?.completed,
  });

  useEffect(() => {
    progressRef.current = {
      courseId: courseProgress?.id,
      videoId: videoProgress?.id,
      completedVideos: courseProgress?.completedVideos,
      lastVideoPlayed: courseProgress?.lastVideoPlayed,
      progressTime: videoProgress?.progressTime,
      duration: videoProgress?.duration,
      completed: videoProgress?.completed,
    };
  }, [courseProgress, videoProgress]);

  useEffect(() => {
    //using ref is v imp as we can update the status without re-rendering i.e if i accessed the states inside setInterval they would be having their old/value when mount happended
    // but if i use ref (which acts like a box and tells interval to see whats changed) the current of ref updates and gives latest value to the interval
    // the use effect runs when mounted first but interval runs every 5s and is cleared when unmounted...
    const interval = setInterval(async () => {
      const currentStatus = progressRef.current;
      if (currentStatus.courseId && currentStatus.videoId) {
        try {
          const courseApiRes = await axios.post(
            `http://localhost:3000/course/update/course`,
            {
              completed_videos: currentStatus.completedVideos,
              last_video_played: currentStatus.lastVideoPlayed,
              courseId: currentStatus.courseId,
            },
            { withCredentials: true }
          );
          const videoApiRes = await axios.post(
            `http://localhost:3000/course/update/video`,
            {
              progress_time: currentStatus.progressTime,
              duration: currentStatus.duration,
              completed: currentStatus.completed,
              videoId: currentStatus.videoId,
            },
            { withCredentials: true }
          );
        } catch (error) {
          console.log(error);
        }
      }
    }, 5000);
    // In React, the function you return inside a useEffect is called the Cleanup Function.
    // React runs the Cleanup:Right before the component Unmounts (disappears).(If dependencies change) Right before running the effect again.
    return () => clearInterval(interval); //v imp to remove interval on unmount...
  }, []);

  if (loading || !data || data.length === 0 || !data[activeIndex])
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
        <header className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center justify-center gap-4">
            <div onClick={() => {
              localStorage.clear();
            }}>
              <Link
                to="/courses"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5 backdrop-blur-md group"
              >
                <ChevronLeft className="w-5 h-5 text-zinc-400 group-hover:text-white" />
              </Link>
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-white/90">
                {name}
              </h1>
            </div>
          </div>
          {/* <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
                <p className="text-xs text-zinc-400 font-medium tracking-wide uppercase">
                  Episode {activeIndex + 1}
                </p>
              </div> */}
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

          {/* RIGHT COLUMN: PLAYLIST + CHAT and Notes */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {/* 1. COURSE CONTENT ACCORDION */}
            <div className="max-h-135 flex flex-col bg-[#141414]/60 backdrop-blur-xl border border-white/5 rounded-lg overflow-hidden transition-all duration-300">
              {/* Header */}
              <div
                onClick={() => {
                  setIsContentOpen(true);
                  setIsChatOpen(false);
                  setIsCardsOpen(false);
                }}
                className="px-5 py-3 border-b border-white/5 flex justify-between items-center bg-white/2 shrink-0 cursor-pointer group/header hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                    Course Content
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-zinc-500 transition-transform duration-500 ease-in-out ${
                      isContentOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </div>
                <span className="text-[11px] font-bold text-zinc-400">
                  {JSON.parse(
                    localStorage.getItem(
                      `completed_videos_${data?.[activeIndex]?.playlist}`
                    )
                  )?.length || courseData?.[0]?.completedVideos?.length
                    ? JSON.parse(
                        localStorage.getItem(
                          `completed_videos_${data?.[activeIndex]?.playlist}`
                        )
                      )?.length - 1 ||
                      courseData?.[0]?.completedVideos?.length - 1
                    : courseData?.[0]?.completedVideos?.length - 1}{" "}
                  / {data?.length} Completed
                </span>
              </div>

              {/* Body */}
              <div
                className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
                  isContentOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden ">
                  {/* Scrollable Area */}
                  <div className="p-3 md:pb-28 space-y-2 max-h-90 md:max-h-150 overflow-y-auto custom-scrollbar hover:pr-2">
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
                    ? ` ${
                        (JSON.parse(
                          localStorage.getItem(
                            `video_${data[index].videoId}_progress`
                          )
                        )?.completed || data?.[index]?.completed) === true
                          ? "bg-green-500/5 border-green-500/20"
                          : "bg-[#2563EB]/5 border-[#2563EB]/20"
                      }`
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
                      ? `${
                          (JSON.parse(
                            localStorage.getItem(
                              `video_${data[index].videoId}_progress`
                            )
                          )?.completed || data?.[index]?.completed) === true
                            ? "bg-green-500/80"
                            : "bg-[#2563EB]"
                        } text-black `
                      : `bg-transparent text-zinc-700 border  ${
                          (JSON.parse(
                            localStorage.getItem(
                              `video_${data[index].videoId}_progress`
                            )
                          )?.completed || data?.[index]?.completed) === true
                            ? "border-green-500/50"
                            : "border-white/5"
                        }`
                  }
                  
                `}
                        >
                          {activeIndex === index ? (
                            <Play size={14} fill="black" />
                          ) : (
                            <span className="text-[10px] font-bold ">
                              {(JSON.parse(
                                localStorage.getItem(
                                  `video_${data[index].videoId}_progress`
                                )
                              )?.completed || data?.[index]?.completed) ===
                              true ? (
                                <div className="text-green-500">
                                  <SquareCheckBig size={14} />
                                </div>
                              ) : (
                                index + 1
                              )}
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
                            <div
                              className={`${
                                JSON.parse(
                                  localStorage.getItem(
                                    `video_${data[index].videoId}_progress`
                                  )
                                )?.progressTime || data?.[index]?.progressTime
                                  ? ""
                                  : "hidden"
                              } w-full h-1 bg-zinc-800/50 rounded-full mt-2 overflow-hidden`}
                            >
                              <div
                                className={`h-full ${
                                  (JSON.parse(
                                    localStorage.getItem(
                                      `video_${data[index].videoId}_progress`
                                    )
                                  )?.completed || data[index].completed) ===
                                  true
                                    ? "bg-green-500"
                                    : "bg-[#2563EB]"
                                }  rounded-full opacity-80`}
                                style={{
                                  width: `${
                                    ((JSON.parse(
                                      localStorage.getItem(
                                        `video_${data[index].videoId}_progress`
                                      )
                                    )?.progressTime ||
                                      data?.[index]?.progressTime) /
                                      (JSON.parse(
                                        localStorage.getItem(
                                          `video_${data[index].videoId}_progress`
                                        )
                                      )?.duration ||
                                        data[index].totalDuration)) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span
                              className={`text-[11px] font-medium ${
                                activeIndex === index
                                  ? "text-[#2563EB]"
                                  : "text-zinc-600"
                              }
                              ${
                                JSON.parse(
                                  localStorage.getItem(
                                    `video_${data[index].videoId}_progress`
                                  )
                                )?.progressTime || data?.[index]?.progressTime
                                  ? ""
                                  : "hidden"
                              }
                              `}
                            >
                              {`${Math.floor(
                                ((JSON.parse(
                                  localStorage.getItem(
                                    `video_${data[index].videoId}_progress`
                                  )
                                )?.progressTime ||
                                  data?.[index]?.progressTime) /
                                  (JSON.parse(
                                    localStorage.getItem(
                                      `video_${data[index].videoId}_progress`
                                    )
                                  )?.duration || data[index].totalDuration)) *
                                  100
                              )}%`}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* <div className="sticky bottom-0 h-8 bg-linear-to-t from-[#141414] to-transparent pointer-events-none z-10 -mb-3"></div> */}
                  </div>
                </div>
              </div>
            </div>
            {/* 2. AI TUTOR CHAT (New Card) */}
            <div
              onClick={() => {
                if (
                  JSON.parse(
                    sessionStorage.getItem(`messages_${data?.[activeIndex]?._id}`)
                  )
                ) {
                  setMessages(
                    JSON.parse(
                      sessionStorage.getItem(
                        `messages_${data?.[activeIndex]?._id}`
                      )
                    )
                  );
                } else {
                  setMessages([
                    {
                      role: "system",
                      content:
                        "Hello! I'm your AI learning assistant. I'm watching this video with you. Ask me anything about the content!",
                    },
                  ]);
                }
              }}
              className="h-fit  flex flex-col bg-[#141414]/60 backdrop-blur-xl border border-white/5 rounded-lg overflow-hidden transition-all duration-300"
            >
              {/* Header */}
              <div
                onClick={() => {
                  setIsContentOpen(false);
                  setIsChatOpen(true);
                  setIsCardsOpen(false);
                }}
                className="px-5 py-3 border-b border-white/5 flex justify-between items-center bg-white/2 shrink-0 cursor-pointer group/header hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <BookCopy
                      size={15}
                      className={isChatOpen ? "text-blue-500" : "text-zinc-500"}
                    />
                    AI Tutor
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-zinc-500 transition-transform duration-500 ease-in-out ${
                      !isChatOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${
                    isChatOpen ? "bg-blue-600 animate-pulse" : "bg-zinc-700"
                  }`}
                />
              </div>

              {/* Body */}
              <div
                className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
                  isChatOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
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
            {/* 3. NOTES ACCORDION */}
            <div className="h-fit flex flex-col bg-[#141414]/60 backdrop-blur-xl border border-white/5 rounded-lg overflow-hidden transition-all duration-300">
              {/* Header */}
              <div
                onClick={() => {
                  setIsContentOpen(false);
                  setIsChatOpen(false);
                  setIsCardsOpen(true);
                  setNotesLoading(true);
                  getNotesData();
                }}
                className="px-5 py-3 border-b border-white/5 flex justify-between items-center bg-white/2 shrink-0 cursor-pointer group/header hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <PencilRuler
                      size={15}
                      className={
                        isCardsOpen ? "text-blue-500" : "text-zinc-500"
                      }
                    />
                    Notes
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-zinc-500 transition-transform duration-500 ease-in-out ${
                      isCardsOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </div>
              </div>

              {/* Body */}
              <div
                className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
                  isCardsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col h-125 md:max-h-150 relative">
                    {notesLoading ? (
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 items-center justify-center custom-scrollbar">
                        <h1 className="text-center">Loading...</h1>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {currentVideoNotes?.length ? (
                          <div>
                            {currentVideoNotes
                              .map((item, idx) => {
                                return (
                                  <div
                                    key={idx}
                                    className={`group relative p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#2563EB]/30 hover:bg-white/6 transition-all mb-2`}
                                  >
                                    {/* Note Top Row: Time & Actions */}
                                    <div className="flex justify-between items-center mb-2">
                                      <div className="flex items-center gap-2">
                                        <span
                                          onClick={() => {
                                            playerInstanceRef.current.currentTime =
                                              Number(item.timestamp);
                                            playerInstanceRef.current.play();
                                            console.log(
                                              playerInstanceRef.current
                                                .currentTime
                                            );
                                          }}
                                          className="text-[10px] cursor-pointer font-bold text-[#2563EB] bg-[#2563EB]/10 px-1.5 py-0.5 rounded-md border border-[#2563EB]/20"
                                        >
                                          {`${Math.floor(
                                            item?.timestamp / 60
                                          )}:${Math.floor(
                                            (item?.timestamp / 60 -
                                              Math.floor(
                                                item?.timestamp / 60
                                              )) *
                                              60
                                          )}`}
                                        </span>
                                        {/* <span className="text-[12px] font-bold text-zinc-500">
                              Sample Note
                            </span> */}
                                      </div>
                                      {/* Actions */}
                                      <div className="flex gap-2">
                                        <button className="text-zinc-500 hover:text-white cursor-pointer transition-colors">
                                          <Pencil size={12} />
                                        </button>
                                        <button
                                          onClick={async () => {
                                            await deletNotes(item._id);
                                          }}
                                          className="text-zinc-500 hover:text-red-500 cursor-pointer transition-colors"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                    {/* Note Content */}
                                    <p className="text-sm text-zinc-300 leading-relaxed">
                                      {item?.notesContent}
                                    </p>
                                  </div>
                                );
                              })
                              .reverse()}
                          </div>
                        ) : (
                          ""
                        )}
                        {/* { sample note } */}
                        <div
                          className={`${
                            currentVideoNotes?.length ? "hidden" : ""
                          } group relative p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#2563EB]/30 hover:bg-white/6 transition-all`}
                        >
                          {/* Note Top Row: Time & Actions */}
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-[#2563EB] bg-[#2563EB]/10 px-1.5 py-0.5 rounded-md border border-[#2563EB]/20">
                                12:45
                              </span>
                              <span className="text-[12px] font-bold text-zinc-500">
                                Sample Note
                              </span>
                            </div>
                            {/* Actions */}
                            <div className="flex gap-2">
                              <button className="text-zinc-500 hover:text-white cursor-pointer transition-colors">
                                <Pencil size={12} />
                              </button>
                              <button className="text-zinc-500 hover:text-red-500 cursor-pointer transition-colors">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                          {/* Note Content */}
                          <p className="text-sm text-zinc-300 leading-relaxed">
                            Remember to use flex-direction: column when building
                            the mobile layout for the navbar. The z-index needs
                            to be higher than the hero section.
                          </p>
                        </div>
                      </div>
                    )}
                    {/* Scrollable Notes List */}

                    {/* Input Area */}
                    <form onSubmit={handleNotesSubmit}>
                      <div className="p-3 border-t border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md mt-auto">
                        <div className="relative">
                          <input
                            type="text"
                            autoComplete="off"
                            value={notesInput}
                            onChange={handleNotesInput}
                            name="user_note"
                            placeholder="Add a note at current time..." // Changed placeholder to be relevant
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
