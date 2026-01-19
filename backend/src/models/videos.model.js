import mongoose from "mongoose";

const videoModel = new mongoose.Schema({
    playlist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true        
    },
    channelId:{
        type: String,
        required: true        
    },
    channelTitle:{
        type: String,
        required: true        
    },
    thumbnail:{
        type: String,
    },
    videoId:{
        type: String,
        required: true  
    },
    duration:{
        type: String,
        required:true
    },
    progressTime: {
        type: Number,
        default: 0
    },
    totalDuration: {
        type: Number,
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    },
    notes:[{
        timestamp: {
            type: Number,
            default: 0
        },
        notesContent: {
            type: String,
            default: ""
        }
    }]

},{timestamps: true});


export const Video = mongoose.model("Video", videoModel);