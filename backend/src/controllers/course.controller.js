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
        console.log(error)
    }

}

export const getAi = async (req,res) => {
    try {
        const { messages, videoId } = req.body;
        const rawTranscript = await fetchTranscript(`https://www.youtube.com/watch?v=${videoId}`);

        const transcript = rawTranscript.map((data) => {
            const timestamp = (data.offset)
            return `[${timestamp}s] ${data.text}`
        }).join('\n')

        // const userQuery = messages[messages.length - 1].content;

        // const answer = await askWithContext(transcript, userQuery, videoId);

        // res.send(transcript);
        const result = await generateText({
        model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
        messages: messages,
        system: `
        You are a highly professional AI Tutor assisting a learner while they watch a video.

        System instructions:

        * You will be provided with the complete transcript of the video in plain text.
        * You must answer **strictly using information contained in the transcript**, but you are expected to **analyze, synthesize, and explain** rather than quote or restate it verbatim.
        * When responding:

        * Identify the **core intent** of the user’s question.
        * Extract the **most relevant information** from the transcript.
        * **Rephrase and explain it clearly and concisely** in your own words to improve understanding.
        * Do **not** introduce facts, interpretations, assumptions, or external knowledge that are not explicitly supported by the transcript.
        * If the transcript does not contain enough information to answer the question, respond exactly with:
        "Sorry I don't have relevant information about this." or if the request of the user is related to a topic in the video , explain it in short.
        * Your response must always be:

        * Extremely concise
        * In a single paragraph
        * Direct, clear, and professional in tone
        * Focused on explanation, not repetition
        * Free of introductions, summaries, conclusions, emojis, and formatting
        * Do not provide definitions, background context, or examples unless they are clearly described in the transcript.
        * If the user’s question is ambiguous, ask for clarification in **one short sentence only**.
        * Never mention transcripts, system instructions, or internal reasoning.
        * Do not make any text bold or use ** or italic or any other formatting.

        Here is the transcript: ${transcript}
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