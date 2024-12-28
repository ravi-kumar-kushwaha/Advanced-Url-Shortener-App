import express from 'express'
import verifyToken from '../middleware/auth.middleware.js';
import {
    cerateShortUrl,
    getOverallAnalytics,
    getTopicBasedAnalytics,
    getTotalAnalyticsData,
    redirectUrl
} from '../controllers/urlShortner.js';
import rateLimiter from '../middleware/rateLimiter.middleware.js';
const router = express.Router();
/**
 * @openapi
 * /api/v1/shorten:
 *   post:
 *     summary: Create a short URL
 *     description: Create a short URL by providing the original URL.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               type: object
 *               properties:
 *                 shortUrl:    
 *                   type: string   
 *                   example: 'https://short-url.com/1234567890'
 *                 originalUrl:
 *                   type: string
 *                   example: 'https://www.example.com'
 *                 customAlias:
 *                   type: string
 *                   example: 'custom-alias'
 *                 topic:
 *                   type: string
 *                   example: 'acquisition'
 *                 clicksHistory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       timestamp:
 *                         type: string
 *                         example: '2023-05-01T12:00:00.000Z'
 *     responses:
 *       201:
 *         description: Short URL created successfully
 *         content:
 *           application/json:
 *             schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: 'Short URL created successfully'    
 *               success:
 *                 type: boolean
 *                 example: true       
 *               data:
 *                 type: object
 *                 properties:
 *                   shortUrl:
 *                     type: string
 *                     example: 'https://short-url.com/1234567890'
 *                   originalUrl:
 *                     type: string
 *                     example: 'https://www.example.com'
 *                   customAlias:
 *                     type: string
 *                     example: 'custom-alias'
 *                   topic:
 *                     type: string
 *                     example: 'acquisition'
 *                   clicksHistory:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         timestamp:
 *                           type: string
 *                           example: '2023-05-01T12:00:00.000Z'    
 *       401:
 *         description: Unauthorized - Token is missing or invalid  
 *       400:
 *         description: Bad request - Invalid input data
 *       500:   
 *         description: Internal server error           
 */

router.post("/shorten", verifyToken, cerateShortUrl);
/**
 * @openapi
 * /api/v1/shorten/{alias}:
 *   get:
 *     summary: Redirect to the original URL
 *     description: Redirect to the original URL associated with the provided alias.
 *     parameters:
 *       - name: alias
 *         in: path
 *         required: true
 *         description: The alias of the short URL
 *         schema:
 *           type: string
 *           example: '1234567890'                                     
 *     responses:
 *       301:
 *         description: Redirect to the original URL
 *       404:
 *         description: Short URL not found - Alias does not exist       
 *       500:
 *         description: Internal server error               
 */
router.get("/shorten/:alias", rateLimiter, redirectUrl);
/**
 * @openapi
 * /api/v1/analytics/{alias}:
 *   get:
 *     summary: Get analytics data for a specific short URL
 *     description: Retrieve analytics data for a specific short URL based on the provided alias.
 *     parameters:
 *       - name: alias
 *         in: path
 *         required: true
 *         description: The alias of the short URL
 *         schema:
 *           type: string
 *           example: '1234567890'                                     
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Analytics data retrieved successfully'
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     alias:
 *                       type: string
 *                       example: '1234567890'
 *                     timestamp:
 *                       type: string   
 *                       example: '2023-05-01T12:00:00.000Z'
 *                     userAgent:
 *                       type: string
 *                       example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' 
 *       404:
 *         description: Short URL not found - Alias does not exist
 *       500:
 *         description: Internal server error           
 */
router.get("/analytics/:alias", getTotalAnalyticsData);
/**
 * @openapi
 * /api/v1/analytics/topic/{topic}:
 *   get:
 *     summary: Get analytics data for a specific topic
 *     description: Retrieve analytics data for a specific topic based on the provided topic.
 *     parameters:
 *       - name: topic
 *         in: path
 *         required: true
 *         description: The topic of the short URL
 *         schema:
 *           type: string
 *           example: 'acquisition'                                     
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Analytics data retrieved successfully'
 *                 success:
 *                   type: boolean                  
 *                 data:
 *                   type: object                   
 *                   properties:
 *                     alias:   
 *                       type: string   
 *                       example: '1234567890'
 *                     timestamp:       
 *                       type: string       
 *                       example: '2023-05-01T12:00:00.000Z'         
 *                     userAgent:
 *                       type: string                               
 *                       example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' 
 *       404:
 *         description: Topic not found - Topic does not exist
 *       500:
 *         description: Internal server error           
 */ 
router.get("/analytics/topic/:topic", getTopicBasedAnalytics);
/**
 * @openapi
 * /api/v1/analytics/get/overall:
 *   get:
 *     summary: Get overall analytics data
 *     description: Retrieve overall analytics data for all short URLs.
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Analytics data retrieved successfully'
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUrls:
 *                       type: number
 *                       example: 10
 *                     totalClicks:
 *                       type: number
 *                       example: 100
 *                     totalUniqueClicks:
 *                       type: number
 *                       example: 50
 *       404:
 *         description: Topic not found - Topic does not exist      
 *       500:
 *         description: Internal server error           
 */ 
router.get("/analytics/get/overall", verifyToken, getOverallAnalytics);

export default router