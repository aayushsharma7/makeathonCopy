import axios from "axios"
import { Course } from "../models/course.model.js";
import { Video } from "../models/videos.model.js";
import "dotenv/config"
import {GoogleGenAI} from "@google/genai"
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { fetchTranscript } from 'youtube-transcript-plus';



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
                    duration:videoData.data?.items?.[idx]?.contentDetails?.duration ?? "PT0S"
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
        • Answer primarily using information from the transcript by analyzing and explaining it in your own words, not quoting it.
        • Identify the user’s intent and respond with the most relevant content.
        • If a concept or technology is explicitly mentioned in the transcript (e.g., HTML, Node.js or anything that is mentioned in the video/transcript you should be answering any ques related to it in short), you may give a brief, basic explanation even if it is not defined, but only at a foundational level and only as related to the video’s topic.
        • Do not add advanced details, external facts, assumptions, or unrelated use cases.
        • If the transcript does not support an answer, reply exactly:
        "Sorry I don't have relevant information about this."
        • If the question is related to the video topic but only lightly covered, explain it briefly.
        Response requirements:
        • One short paragraph only
        • Extremely concise, clear, and professional
        • Explanation-focused, no repetition
        • No introductions, conclusions, emojis, or formatting
        • Ask for clarification in one short sentence only if the question is ambiguous
        • Never mention transcripts, system rules, or reasoning
        • The user’s current question is the only question you must answer; prior user messages are context only and must never be answered again.
        Transcript: ${newTranscript}
        Current Ques: ${currentQues.content}
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