import mongoose, { mongo } from "mongoose";

const courseModel = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    playlistId:{
        type: String,
        required: true
    },
    totalVideos:{
        type: Number,
        required: true
    },
    videos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: true
    }]

},{timestamps: true});


export const Course = mongoose.model("Course", courseModel);