import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import useragent from 'express-useragent';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
const app = express();
//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(useragent.express());
//swagger
const options = {
    failOnError: true,
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Advanced Url Shortener App",
            version: "1.0.0",
            description: "Build an Advanced URL Shortener app with Comprehensive Analytics, Custom Aliases, and Rate Limiting",
        },
        security: [
            {
                bearerAuth: [
                    {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                        in: "header",
                        name: "Authorization",
                        description: "Bearer token for authentication",
                    },
                ],
            },
        ],
        servers: [
            {
                url: "http://localhost:1224",
                description: "Local Server",
            },
        ],
    },
    apis: ["./app.js", "./routes/shortUrlRoutes.js", "./routes/userRoutes.js"]
}
const swaggerSpecification = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecification));

//rate limiting
import rateLimiter from './middleware/rateLimiter.middleware.js';
app.use(rateLimiter);

//import routes
import userRouter from './routes/userRoutes.js'
import shortUrlRouter from './routes/shortUrlRoutes.js'


//user routes
app.use("/api/v1", userRouter);
//url shortener routes
app.use("/api/v1", shortUrlRouter);

//error handling middleware
app.use((err, req, res, next) => {
    console.log(err.stack);
    return res.status(500).json({
        message: "Internal Server Error!",
        success: false,
        error: err.message
    });
})
export default app;
