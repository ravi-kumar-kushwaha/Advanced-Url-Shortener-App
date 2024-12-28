import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';

const verifyToken = async(req,res,next)=>{
    const jwtToken = req.cookies.accessToken || req.headers['authorization']?.replace("Bearer ","");
    // const jwtToken = req.headers.authorization?.split(" ")[1];
        if(!jwtToken){
            return res.status(400).json({
                message:"Authorization Failed!",
                success:false
            })
        }
    try {
        const decodedToken = jwt.verify(jwtToken,process.env.JWT_SECRET);
        if(!decodedToken){
            return res.status(400).json({
                message:"Unautorized User!",
                success:false
            })
        }
        // console.log(jwtToken);
        // console.log("decodedToken:",decodedToken);
        // console.log("decodedTokenId:",decodedToken.id);
        const user = await User.findById(decodedToken.id);
        // console.log("user:",user);
        if(!user){
            return res.status(400).json({
                message:"Unautorized User!",
                success:false
            })
        }
        req.user = user;
        next();
    } catch (error) {
        console.log("error:",error);
        return res.status(500).json({
            message:"Internal Server Error!",
            success:false
        })
    }
}
export default verifyToken;