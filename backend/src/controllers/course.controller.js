import axios from "axios"
import { Course } from "../models/course.model.js";
import { Video } from "../models/videos.model.js";
import "dotenv/config"


export const courseController = async (req,res) => {
    try {

        const playlistID = await req.body.url.split('list=')[1];
        const checkArr = await Course.find({
            playlistId: playlistID,
            owner: req.body.owner
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
                owner: req.body.owner,
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
            owner: req.params.owner
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