import Analytics from "../models/analytics.models.js";
import Url from "../models/urlShortener.models.js";
import shortid from "shortid"
import requestIp from 'request-ip';
import geoip from 'geoip-lite'
import moment from "moment/moment.js";
const cerateShortUrl = async (req, res) => {
    try {
        const { originalUrl, customAlias, topic } = req.body;
        if (!originalUrl) {
            return res.status(400).json({
                message: "original Url is required!",
                success: false
            })
        }

        let alias = customAlias || shortid.generate();
        if (customAlias) {
            const customAliasExists = await Url.findOne({ shortUrl: customAlias });
            if (customAliasExists) {
                return res.status(400).json({
                    message: "Custom Alias already exists!",
                    success: false
                })
            }
        }

        const url = await Url.create({
            originalUrl,
            shortUrl: process.env.BASE_URL + `/${alias}`,
            customAlias: customAlias || alias,
            topic: topic,
            user: req.user.id
        });

        // console.log("url:", url);
        if (url) {
            return res.status(201).json({
                message: "Short Url Created Successfullu!",
                success: true,
                data: url
            })
        } else {
            return res.status(400).json({
                message: "Something went wrong while creating the short url!",
                success: false
            })
        }
    } catch (error) {
        // console.log("error", error);
        return res.status(500).json({
            message: "Internal Server Error!",
            success: false
        })
    }
}

//redirect to original url
const redirectUrl = async (req, res) => {
    try {
        const alias = req.params.alias;
        if (!alias) {
            return res.status(400).json({
                message: "Alias is required!",
                success: false
            })
        }
        const url = await Url.findOne({
            shortUrl: process.env.BASE_URL + `/${alias}`
        })
        // console.log("url:", url);
        if (!url) {
            return res.status(400).json({
                message: "Something Went Wrong While Redirecting to Original Url!",
                success: false
            })
        }
        //capture analytics data
        const userAgent = req.headers['user-agent'];
        const ipAddress = requestIp.getClientIp(req);
        const geoLocation = geoip.lookup(ipAddress);

        const createAnalytics = await Analytics.create({
            alias,
            userAgent,
            ipAddress,
            geoLocation
        })
        if (!createAnalytics) {
            return res.status(400).json({
                message: "Something went wrong while creating analytics data!",
                success: false
            })
        }
        return res.redirect(url.originalUrl);
    } catch (error) {
        // console.log("error", error);
        return res.status(500).json({
            message: "Internal Server Error!",
            success: false
        })
    }
}

//get totalAnalytics details
const getTotalAnalyticsData = async (req, res) => {
    try {
        const alias = req.params.alias;
        if (!alias) {
            return res.status(400).json({
                message: "alias is required!",
                success: false
            });
        }

        const analyticsData = await Analytics.find({ alias });
        // console.log("analyticsData:", analyticsData);

        if (!analyticsData || analyticsData.length === 0) {
            return res.status(400).json({
                message: "No analytics data found!",
                success: false
            });
        }

        // Total clicks
        const totalClicks = analyticsData.length;

        // Unique clicks
        const uniqueClicks = new Set(analyticsData.map((item) => item.ipAddress)).size;

        // Clicks by date
        const clicksByDate = Array.from({ length: 15 }, (_, i) => {
            const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
            const count = analyticsData.filter((item) => moment(item.timestamp).format('YYYY-MM-DD') === date).length;
            return {
                date,
                count
            };
        }).reverse();

        // OS type statistics
        const osStatstics = {};
        analyticsData.forEach(({ userAgent }) => {
            if (typeof userAgent === 'string') {
                const osName = userAgent.split(/[()]/)[1]?.split(';')[0]?.trim();
                if (osName) {
                    if (!osStatstics[osName]) {
                        osStatstics[osName] = { uniqueClicks: 0, uniqueUsers: new Set() };
                    }
                    osStatstics[osName].uniqueClicks += 1;
                    osStatstics[osName].uniqueUsers.add(userAgent);
                }
            }
        });

        const osType = Object.entries(osStatstics).map(([osName, stats]) => ({
            osName,
            uniqueClicks: stats.uniqueClicks,
            uniqueUsers: stats.uniqueUsers.size,
        }));

        // Device type statistics
        const deviceStatstics = {};
        analyticsData.forEach(({ userAgent }) => {
            if (typeof userAgent === 'string') {
                const deviceName = userAgent.includes('Mobile') ? 'mobile' : 'desktop';
                if (!deviceStatstics[deviceName]) {
                    deviceStatstics[deviceName] = { uniqueClicks: 0, uniqueUsers: new Set() };
                }
                deviceStatstics[deviceName].uniqueClicks += 1;
                deviceStatstics[deviceName].uniqueUsers.add(userAgent);
            }
        });

        const deviceType = Object.entries(deviceStatstics).map(([deviceName, stats]) => ({
            deviceName,
            uniqueClicks: stats.uniqueClicks,
            uniqueUsers: stats.uniqueUsers.size,
        }));

        return res.status(200).json({
            message: "Analytics Data Fetched Successfully!",
            success: true,
            data: {
                totalClicks,
                uniqueClicks,
                clicksByDate,
                osType,
                deviceType
            }
        });
    } catch (error) {
        // console.log("error:", error);
        return res.status(500).json({
            message: "Internal Server Error!",
            success: false
        });
    }
};
//Get Topic-Based Analytics API:
const getTopicBasedAnalytics = async (req, res)=>{
    const topic = req.params.topic;
        if(!topic){
            return res.status(400).json({
                message:"Topic is required!",
                success:false
            })
        }
    try {
       //all short URLs grouped under a specific topic
        const allShortUrls = await Url.find({topic});
        // console.log("allShortUrls:",allShortUrls);
        if(!allShortUrls || allShortUrls.length === 0 ){
            return res.status(400).json({
                message:"No Short Urls Found!",
                success:false
            })
        }
        const analyticsData = await Analytics.find({
            alias:{
                $in:allShortUrls.map((url)=>url.customAlias)
            }
        })
        // console.log("analyticsData:",analyticsData);
        if(!analyticsData || analyticsData.length === 0){
            return res.status(400).json({
                message:"No Analytics Data Found!",
                success:false
            })
        }
        //Total Clicks for a specific topic
        const totalClicks = analyticsData.length;
        //Unique Clicks for a specific topic
        const uniqueClicks = new Set(analyticsData.map((data) => data.ipAddress)).size;

        // Calculate clicks by date 
        const clicksByDate = Array.from({ length: 15 }, (_, i) => {
            const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
            const count = analyticsData.filter((item) => moment(item.timestamp).format('YYYY-MM-DD') === date).length;
            return { date, count };
        }).reverse();

        // calculate analytics for each URL
        const urls = allShortUrls.map((url) => {
            const urlAnalytics = analyticsData.filter((item) => item.alias === url.customAlias);
            const urlUniqueClicks = new Set(urlAnalytics.map((item) => item.ipAddress)).size;
            return {
                shortUrl: `${url.shortUrl}`,
                totalClicks: urlAnalytics.length,
                uniqueClicks: urlUniqueClicks,
            };
        });

        return res.status(200).json({
            message:"Topic Based Analytics Data Fetched Successfully!",
            success:true,
            data:{
                totalClicks,
                uniqueClicks,
                clicksByDate,
                urls
            }
        })
    } catch (error) {
        // console.log("error:",error);
        return res.status(500).json({
            message:"Internal Server Error!",
            success:false
        })
    }
}
//Get Overall Analytics API:
const getOverallAnalytics = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming authenticated user info is attached to req.user
        // console.log("userId:",userId);
        // Get all short URLs created by the user
        const userUrls = await Url.find({user:userId});
        // console.log("userUrls:",userUrls);
        if (!userUrls || userUrls.length === 0) {
            return res.status(400).json({
                message: "No URLs found for the user!",
                success: false,
            });
        }

        // Retrieve analytics data for all URLs created by the user
        const aliases = userUrls.map((url) => url.customAlias);
        const analyticsData = await Analytics.find({ alias: { $in: aliases } });

        if (!analyticsData || analyticsData.length === 0) {
            return res.status(400).json({
                message: "No analytics data found for the user's URLs!",
                success: false,
            });
        }

        // Calculate total URLs
        const totalUrls = userUrls.length;

        //Calculate total and unique clicks
        const totalClicks = analyticsData.length;
        const uniqueClicks = new Set(analyticsData.map((item) => item.ipAddress)).size;

        // Calculate clicks by date
        const clicksByDate = Array.from({ length: 15 }, (_, i) => {
            const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
            const count = analyticsData.filter((item) => moment(item.timestamp).format('YYYY-MM-DD') === date).length;
            return { date, count };
        }).reverse();

        //Calculate OS type analytics
        const osStatistics = {};
        analyticsData.forEach(({ userAgent }) => {
            const osName = userAgent.split(/[()]/)[1]?.split(';')[0]?.trim() || 'Unknown';
            if (!osStatistics[osName]) {
                osStatistics[osName] = { uniqueClicks: 0, uniqueUsers: new Set() };
            }
            osStatistics[osName].uniqueClicks += 1;
            osStatistics[osName].uniqueUsers.add(userAgent);
        });

        const osType = Object.entries(osStatistics).map(([osName, stats]) => ({
            osName,
            uniqueClicks: stats.uniqueClicks,
            uniqueUsers: stats.uniqueUsers.size,
        }));

        //Calculate device type analytics
        const deviceStatistics = {};
        analyticsData.forEach(({ userAgent }) => {
            const deviceName = userAgent.includes('Mobile') ? 'mobile' : 'desktop';
            if (!deviceStatistics[deviceName]) {
                deviceStatistics[deviceName] = { uniqueClicks: 0, uniqueUsers: new Set() };
            }
            deviceStatistics[deviceName].uniqueClicks += 1;
            deviceStatistics[deviceName].uniqueUsers.add(userAgent);
        });

        const deviceType = Object.entries(deviceStatistics).map(([deviceName, stats]) => ({
            deviceName,
            uniqueClicks: stats.uniqueClicks,
            uniqueUsers: stats.uniqueUsers.size,
        }));

        // Return response
        return res.status(200).json({
            message: "Overall analytics fetched successfully!",
            success: true,
            data: {
                totalUrls,
                totalClicks,
                uniqueClicks,
                clicksByDate,
                osType,
                deviceType,
            },
        });
    } catch (error) {
        // console.error("Error:", error);
        return res.status(500).json({
            message: "Internal Server Error!",
            success: false,
        });
    }
};

export {
    cerateShortUrl,
    redirectUrl,
    getTotalAnalyticsData,
    getTopicBasedAnalytics,
    getOverallAnalytics
};





