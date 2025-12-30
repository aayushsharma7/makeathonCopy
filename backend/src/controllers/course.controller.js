import axios from "axios"
import { Course } from "../models/course.model.js";
import { Video } from "../models/videos.model.js";
import "dotenv/config"


export const courseController = async (req,res) => {
    try {

        const playlistID = req.body.url.split('list=')[1];
        const courseData = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?key=${process.env.YT_API_KEY}&part=snippet&playlistId=${playlistID}&maxResults=50`);

        const ytVideoIds = courseData.data.items.map((vid,idx) => {
            return vid.snippet.resourceId.videoId
        })

        const ytString = ytVideoIds.join();
        const videoData = await axios.get(`https://www.googleapis.com/youtube/v3/videos?key=${process.env.YT_API_KEY}&part=contentDetails,statistics,status&id=${ytString}&maxResults=50`);
        const newCourse = new Course({
            title: req.body.name,
            playlistId: playlistID,
            totalVideos: courseData.data.pageInfo.totalResults,
            videos: []
        })
        newCourse.save()

        const videoArray = courseData.data.items.map((vid,idx) => { //array of vid objects
            return {
                playlist: newCourse._id,
                title:vid.snippet.title,
                description:vid.snippet.description,
                channelId:vid.snippet.channelId,
                channelTitle:vid.snippet.channelTitle,
                thumbnail:vid.snippet.thumbnails.maxres.url,
                videoId:vid.snippet.resourceId.videoId,
                duration:videoData.data.items[idx].contentDetails.duration
            }
        })

        const videosAll = await Video.insertMany(videoArray)

        const videoIDs = videosAll.map((vid,idx) => {
            return vid._id;
        })
        
        const updatedCourse  = await Course.findByIdAndUpdate(newCourse._id, {
            videos: videoIDs
        })

        res.status(200).send(updatedCourse);

    } catch (error) {
        res.status(400).send("Error occured")
        console.log("error: ",error)
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