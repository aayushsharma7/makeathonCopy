import axios from "axios"
import { Course } from "../models/course.model.js";
import { Video } from "../models/videos.model.js";
import "dotenv/config"
import {GoogleGenAI} from "@google/genai"
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { fetchTranscript } from 'youtube-transcript-plus';
import { Notes } from "../models/note.model.js";



export const courseController = async (req,res) => {
    try {

        const playlistID = await req.body.url.split('list=')[1];
        const checkArr = await Course.find({
            playlistId: playlistID,
            owner: req.user.username
        })

        if(checkArr.length===0){

            const courseData = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?key=${process.env.YT_API_KEY}&part=snippet&playlistId=${playlistID}&maxResults=50`);
            const ytVideoIds = courseData.data.items.map((vid,idx) => {
                return vid.snippet.resourceId.videoId
            })

            const ytString = ytVideoIds.join();
            // console.log(ytString)
            const videoData = await axios.get(`https://www.googleapis.com/youtube/v3/videos?key=${process.env.YT_API_KEY}&part=contentDetails,statistics,status&id=${ytString}&maxResults=50`);
            const newCourse = new Course({
                title: req.body.name,
                playlistId: playlistID,
                totalVideos: courseData.data.pageInfo.totalResults,
                videos: [],
                owner: req.user.username,
                thumbnail: courseData.data.items[0].snippet.thumbnails.maxres?.url || courseData.data.items[0].snippet.thumbnails.standard?.url || courseData.data.items[0].snippet.thumbnails.high?.url || courseData.data.items[0].snippet.thumbnails.default?.url,
                completedVideos: [-1],
                lastVideoPlayed: 0
            })
            newCourse.save();

            const videoArray = courseData.data.items.map((vid,idx) => { //array of vid objects
                return {
                    playlist: newCourse._id,
                    title:vid.snippet.title ?? "No title",  // ?? is nullish check basically provides default value incase its null/undefined
                    description:vid.snippet.description ?? "No description",
                    channelId:vid.snippet.channelId,
                    channelTitle:vid.snippet.channelTitle,
                    thumbnail:vid.snippet.thumbnails.maxres?.url || vid.snippet.thumbnails.standard?.url || vid.snippet.thumbnails.high?.url || vid.snippet.thumbnails.default?.url,
                    //maxres wasnt available in some vids so set OR
                    videoId:vid.snippet.resourceId.videoId,
                    duration:videoData.data?.items?.[idx]?.contentDetails?.duration ?? "PT0S",
                    progressTime: 0,
                    totalDuration: 0,
                    completed: false,
                }
            })

            const videosAll = await Video.insertMany(videoArray)

            const videoIDs = videosAll.map((vid,idx) => {
                return vid._id;
            })
            
            const updatedCourse  = await Course.findByIdAndUpdate(newCourse._id, {
                videos: videoIDs
            })

            res.status(200).send(`Course created successfully` );
        }
        else{
            res.status(409).send("Already Exists")
            console.log("Course not created: Already Exists")
        }

    } catch (error) {
        res.status(400).send("Error occured")
        console.log("error: ",error)
    }
}


export const getCourse =  async (req,res) => {
    try {
        const courses = await Course.find({
            owner: req.user.username
        })
        if(courses.length===0){
            res.status(200).send("No courses found")
        }
        else{
            res.status(200).send(courses)
        }
    } catch (error) {
        console.log(error)
    }
}
export const getSingleCourse =  async (req,res) => {
    try {
        const courses = await Course.find({
            _id: req.params.id
        })
        if(courses.length===0){
            res.status(200).send("No courses found")
        }
        else{
            res.status(200).send(courses)
        }
    } catch (error) {
        console.log(error)
    }
}

export const getVideo =  async (req,res) => {
    try {
        const video =  await Video.findById(req.params.id)
        res.status(200).send(video)
    } catch (error) {
        console.log(error)
    }
}

export const getCourseData = async(req,res) => {

    try {
        const courses = await Video.find({
            playlist: req.params.id
        })
        if(courses.length===0){
            res.status(200).send("No courses found")
        }
        else{
            res.status(200).send(courses)
        }
    } catch (error) {
        console.log(error);
    }

}

export const getAi = async (req,res) => {
    try {
        const { messages, videoId, start, end, currentQues } = req.body;
        const rawTranscript = await fetchTranscript(`https://www.youtube.com/watch?v=${videoId}`);

        const processedTranscript = [];

        const transcript = rawTranscript.map((data) => {
            const timestamp = (data.offset);
            if(timestamp >= start && timestamp <=end){
                processedTranscript.push(data);
            }
            return `[${timestamp}s] ${data.text}`
        }).join('\n')

        const newTranscript = processedTranscript.map((data) => {
            const timestamp = (data.offset);
            return `[${timestamp}s] ${data.text}`
        }).join('\n')

        // res.send(newTranscript);

        // const userQuery = messages[messages.length - 1].content;

        // const answer = await askWithContext(transcript, userQuery, videoId);

        // res.send(transcript);
        const result = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        messages: messages,
        system: `
        You are a professional AI Tutor assisting a learner while they watch a video.
        You are given the video transcript as plain text.
        Rules:
        • Identify the user’s intent and focus on helping them understand their question clearly.
        • Use the transcript as the primary reference to stay aligned with the video’s topic, but do not repeat or restate it verbatim unnecessarily unless needed.
        • If a concept, tool, or technology is mentioned in the video (for example HTML, Node.js, React, etc.), you may explain it briefly at a foundational level even if it is not fully explained in the transcript.
        • You may add minimal additional information beyond the transcript if it directly helps clarify the user’s question and remains consistent with the topic being taught.
        • Do not introduce advanced details, unrelated topics, or deep external knowledge.
        • If the question is unrelated to the video’s topic, respond exactly:
        "Sorry I don't have relevant information about this."
        Response requirements:
        • One short paragraph only
        • Extremely concise, clear, and professional
        • Explanation-focused, not repetition-focused
        • No introductions, conclusions, emojis, or formatting
        • Ask for clarification in one short sentence only if the question is ambiguous
        • Never mention transcripts, system rules, or reasoning
        • The user’s current question is the only question you must answer; prior messages are context only and must never be answered again.
        Transcript: ${newTranscript}
        Current Question: ${currentQues.content}
        `,
        });
        res.status(200).send(result.text);

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Server Error" });
    }

    // const response = await generateText({
    // model: groq('llama-3.1-8b-instant'),
    // prompt: `heres the transcripts : ${transcript}, now can u answer ques based ion this video? 
    // Ques : I dont understand what he taught at 475s `,
    // });

    // res.send(response.text);

    // gemini
    // const ai = new GoogleGenAI({
    //     apiKey: process.env.GEMINI_API_KEY
    // });
    // const response = await ai.models.generateContent({
    //     model: "gemini-2.5-flash",
    //     contents: "Here is a video link: https://www.youtube.com/watch?v=IBrmsyy9R94&pp=ygUYbGF6eSBsb2FkaW5nIGluIHJlYWN0IGpz,  Now can you see/learn/know what is inside the videoa and answer questions based on the video if asked? ",
    // });
    // res.send(response.text);
}

export const updateCourseProgess = async (req,res) => {
    try {
        const {completed_videos, last_video_played, courseId} = req.body;
        
        const newUpdatedCourse = await Course.findByIdAndUpdate(courseId, {
            completedVideos: completed_videos,
            lastVideoPlayed: last_video_played,
        });

        res.status(200).send("Course Progress Updated Successfully")
        // console.log("Course Progress Updated Successfully")

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
}
export const updateVideoProgess = async (req,res) => {
    try {
        const {progress_time, duration, completed, videoId} = req.body;
        const newUpdatedVideo = await Video.findByIdAndUpdate(videoId, {
            progressTime: progress_time,
            totalDuration: duration,
            completed: completed
        });

        res.status(200).send("Video Progress Updated Successfully")
                // console.log("Video Progress Updated Successfully")


    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
}

export const updateVideoNotes = async (req,res) => {
    try {
        const {newNote, videoId} = req.body;
        const createdNewNote = new Notes(newNote);
        createdNewNote.save();
        const resp = await Video.findById(videoId);
        resp.notes.push(createdNewNote._id);
        await resp.save();
        // console.log({ 
        //     message: "Note updated successfully", notes: resp.notes
        // })
        res.status(200).json({ 
            message: "Note updated successfully", notes: resp.notes
        });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
}
export const getVideoNotes = async (req,res) => {
    try {
        const notes = await Notes.find({
            videoId: req.params.id
        })
        if(notes.length===0){
            res.status(200).send([{
                videoId: req.params.id,
                timestamp: 200,
                notesContent: "Sample Note"
            }])
        }
        else{
            res.status(200).send(notes);
            // console.log("Notes: ",notes);
        }

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Server Error" });
    }

}

export const deleteVideoNotes = async (req,res) => {
    try {
        const {noteId, videoId} = req.body;
        const resp = await Video.findById(videoId);
        const newArr = resp.notes.filter((e) => (e !== noteId));
        const resp2 = await Notes.findByIdAndDelete(noteId);
        resp.notes = newArr;
        await resp.save();
        // console.log({ 
        //     message: "Note deleted successfully", notes: resp.notes
        // })
        res.status(200).json({ 
            message: "Note deleted successfully", notes: resp.notes
        });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
}
// courseData.data.items.map((vid,idx) => {
        //     const newVid =  new Video({
        //         playlist: newCourse._id,
        //         title:vid.snippet.title,
        //         description:vid.snippet.description,
        //         channelId:vid.snippet.channelId,
        //         channelTitle:vid.snippet.channelTitle,
        //         thumbnail:vid.snippet.thumbnails.maxres.url,
        //         videoId:vid.snippet.resourceId.videoId,
        //         duration:videoData.data.items[idx].contentDetails.duration
        //     })
        //     newVid.save(); 
        // }) - //instead of this use insertMany()