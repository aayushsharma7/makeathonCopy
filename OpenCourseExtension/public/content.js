const checkAuth = async () => {
    try {
        const response = await chrome.runtime.sendMessage({ action: "CHECK_AUTH" });
        if (response && response.success && response.data?.success) {
            console.log(response.data);
            
            return true
        } else {
            console.log("❌ Auth Failed:", response.error);
            return false
        }
    } catch (error) {
        return false;
    }
}
 
const checkVideo = async (videoId) => {
    try {
        const response = await chrome.runtime.sendMessage({ action: "CHECK_VIDEO", videoId: videoId });
        if (response.success) {
            // console.log(response.data);
            return {
                success: true,
                data: response.data
            }
        } else {
            console.log("❌  Failed:", response.data);
            return {
                success: false,
                data: response.data
            }
        }
    } catch (error) {
        console.log(error)
        return  {
                success: false,
                data: error
            }
    }
}

const updateVideo = async (dbVideoId, progressTime, duration) => {
    try {
        const response = await chrome.runtime.sendMessage({ action: "UPDATE_VIDEO", videoId: dbVideoId, progressTime: progressTime, duration: duration });
        if (response && response.success) {
            console.log("updated");
            return {
                success: true,
                data: response.data
            }
        } else {
            console.log("❌  Failed:", response.error);
            return {
                success: false,
                data: response.error
            }
        }
    } catch (error) {
        console.log(error)
        return  {
                success: false,
                data: error
            }
    }
}

(async () => {
    const check = await checkAuth();
    if(check){
        console.log(check);
        setInterval(async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const videoId = urlParams.get('v');
            if(videoId){
                const videoElement = document.querySelector('video');
                if(!videoElement){
                    return;
                }
                if(!videoElement.paused){
                    console.log("hi", videoElement.currentTime, videoId);
                }
                else{
                    const checkVideoData = await checkVideo(videoId);
                    console.log(checkVideoData.success);
                    if(checkVideoData.success){
                        console.log("Data Received", checkVideoData.data);
                        // const {progress_time, duration, completed, videoId} = req.body;
                        const progressTime = videoElement.currentTime;
                        const duration = videoElement.duration;
                        const dbVideoId = checkVideoData.data._id;
                        const updatevid = await updateVideo(dbVideoId, progressTime, duration);
                        console.log("update status", updatevid.success, updatevid.data)
                        
                    }
                    else{
                        console.log("Data Received", checkVideoData.data);
                    }
                    // console.log("Data Received", checkVideoData);
                }
            }
            else{
                console.log("go to video");
            }
        }, 5000);
    }
    else{
        console.log("no");
    }
})();


