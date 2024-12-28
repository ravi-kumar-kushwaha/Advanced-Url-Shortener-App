import express from 'express';
import {
    loginUser,
    loginWithGoogle,
    registerUser
} from '../controllers/userCotrollers.js';
import verifyToken from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/auth/google", loginWithGoogle);

/**
 * @openapi
 * /api/v1/users/signup:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user by providing user data (username, email, password).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 example: 'johndoe'
 *               email:
 *                 type: string
 *                 example: 'johndoe@example.com'
 *               password:
 *                 type: string
 *                 example: 'password123'
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'User registered successfully'
 *       400:
 *         description: Bad request (invalid input)
 *       500:
 *         description: Internal server error
 */
router.post("/users/signup", registerUser);

/**
 * @openapi
 * /api/v1/users/signin:
 *   post:
 *     summary: Log in an existing user
 *     description: Log in a user with the provided credentials (email and password). If a token is provided in the Authorization header, it will be verified.
 *     security:
 *       - bearerAuth: [] # Indicates the use of a bearer token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: 'rocky@gmail.com'
 *               password:
 *                 type: string
 *                 example: 'rocky@123'
 *     responses:
 *       200:
 *         description: User successfully logged in. JWT token is returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: 'jwt_token_here'
 *       401:
 *         description: Unauthorized (invalid credentials or token)
 *       500:
 *         description: Internal server error
 */
router.post("/users/signin",verifyToken,loginUser);


export default router;
