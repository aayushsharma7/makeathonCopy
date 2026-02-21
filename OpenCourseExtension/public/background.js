chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => {
  
  if (message.action === "CHECK_AUTH") {
    handleAuthCheck(sendResponse);
    return true;
  }
  if (message.action === "CHECK_VIDEO") {
    const videoId = message.videoId;
    handleVideoCheck(sendResponse, videoId);
    return true;
  }
  if (message.action === "UPDATE_VIDEO") {
    const videoId = message.videoId;
    const progressTime = message.progressTime
    const duration = message.duration
    updateVideoProgress(sendResponse, videoId, progressTime, duration);
    return true;
  }
  
});

const handleAuthCheck = async (sendResponse) => {
    try {
        const res = await fetch('http://localhost:3000/auth/check', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
        });
        const data = await res.json(); //this is a promise (parsing of the resp);
        if(!res.ok || !data?.success){
            return sendResponse({ 
                success: false, 
                error: data?.message || "Auth check failed",
                code: data?.code || res.status
            });
        }
        sendResponse({ 
            success: true, 
            data: data 
        });
        
    } catch (error) {
        sendResponse({ 
            success: false, 
            error: error.message
        });
    }
}
const handleVideoCheck = async (sendResponse,videoId) => {
    try {
        const res = await fetch('http://localhost:3000/course/getVideoData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            videoId: videoId
        }),
        credentials: 'include'
        });
        const data = await res.json(); //this is a promise (parsing of the resp);
        if(!res.ok || !data?.success){
            sendResponse({ 
                success: false, 
                data: data?.message || "No video found",
                code: data?.code || res.status
            });
        }
        else{
            sendResponse({ 
                success: true, 
                data: data?.data,
                code: data?.code || 200
            });
        }
        
        
    } catch (error) {
        sendResponse({ 
            success: false, 
            error: error.message
        });
    }
}
const updateVideoProgress = async (sendResponse,videoId, progressTime, duration) => {
    try {
        const res = await fetch('http://localhost:3000/course/update/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            progress_time: progressTime,
            duration: duration,
            completed: false,
            videoId: videoId,
        }),
        credentials: 'include'
        });
        const data = await res.json(); //this is a promise (parsing of the resp);
        if(!res.ok || !data?.success){
            return sendResponse({ 
                success: false, 
                error: data?.message || "Failed to update video"
            });
        }
        sendResponse({ 
            success: true, 
            data: data?.data
        });
        
    } catch (error) {
        sendResponse({ 
            success: false, 
            error: error.message
        });
    }
}
