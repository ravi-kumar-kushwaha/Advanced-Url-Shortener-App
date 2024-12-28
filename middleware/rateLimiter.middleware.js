import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
    windowMs:60*60*1000,
    max:100,
    statusCode:429,
    message:"Too many requests from this IP, please try again after an hour!"
})
export default rateLimiter;