import User from "../models/user.models.js";
import {OAuth2Client} from 'google-auth-library';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Login with Google
const loginWithGoogle = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({
            message: "Token is required!",
            success: false,
        });
    }

    try {
        // Verify the Google ID token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        console.log("Ticket payload:", ticket.getPayload());

        const { name: userName, email, picture: coverImage } = ticket.getPayload();

        // Check if the user already exists
        let user = await User.findOne({ email });
        if (!user) {
            // If user doesn't exist, create a new user
            user = await User.create({
                userName,
                email,
                coverImage,
            });

            if (!user) {
                return res.status(400).json({
                    message: "Authorization Failed! Could not create user.",
                    success: false,
                });
            }
        }
        // Generate JWT for the user
        const jwtToken = jwt.sign(
            { id: user.id, userName: user.userName, email: user.email, coverImage: user.coverImage },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return res.status(200).json({
            message: "User logged in successfully!",
            success: true,
            data: {
                userName: user.userName,
                email: user.email,
                coverImage: user.coverImage,
            },
            token: jwtToken,
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({
            message: "Internal Server Error!",
            success: false,
            error: error.message,
        });
    }
};

//register user
const registerUser = async (req, res) => {
    try {
        const { userName, email, coverImage, password } = req.body;
        if ([userName, email, password].some((field) => !field)) {
            return res.status(400).json({
                message: "All feilds are required!",
                success: false
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User Already Exista Go To Login Page And Try To Login!",
                success: true,
                data: existingUser
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        if(!hashedPassword){
            return res.status(400).json({
                message:"Something went wrong while hashing the password!",
                success:false
            })
        }
        const user = await User.create({
            userName,
            email,
            coverImage,
            password: hashedPassword
        });
        if (user) {
            return res.status(201).json({
                message: "User Registerd Successfully!",
                success: true,
                data: user
            })
        } else {
            return res.status(400).json({
                message: "Something went wrong while creating user!",
                success: false
            })
        }
    } catch (error) {
        console.log("error:", error);
        return res.status(500).json({
            message: "Internal Server Error!",
            success: false
        })
    }
}

//login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and Password are required for login!",
                success: false
            })
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User does not exists.Go to signup page and create your account to visit the website!.",
                success: false
            })
        }
        const comparePassword = await bcrypt.compare(password, user.password);
        if (!comparePassword) {
            return res.status(400).json({
                message: "Given password is incorrect.please enter correct password!"
            })
        }
        const token = jwt.sign({ id: user._id, name: user.userName, email: user.email },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            });
            if(!token){
                return res.status(400).json({
                    message:"Something went wrong while creating token!",
                    success:false
                })
            }
        return res.status(200).json({
            message: "User Loggedin Successfully!",
            success: true,
            token: token,
            data: user
        })
    } catch (error) {
        console.log("error:", error);
        return res.status(500).json({
            message: "Internal Server Error!",
            success: false
        })
    }
}
export {
    loginWithGoogle,
    registerUser,
    loginUser
}





