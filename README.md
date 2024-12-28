Advanced URL Shortener App
Overview:-
A URL shortening app that allows users to shorten URLs, track analytics (clicks, devices, OS), and organize links by topic.

Features:-
URL Shortening: Shorten URLs with optional aliases.
Analytics: Track clicks, unique clicks, device/OS stats.
Topic Organization: Group and analyze URLs by topics.
Rate Limiting: Prevent abuse.
Endpoints

Create Short URL: POST /api/v1/shorten
Redirect Short URL: GET /api/v1/shorten/:alias
Get Analytics: GET /api/v1/analytics/:alias
Get Topic Analytics: GET /api/v1/analytics/topic/:topic
Get Overall Analytics: GET /api/v1/analytics/get/overall
User Signup: POST /api/v1/users/signup
User Login: POST /api/v1/users/signin
Login With Google: POST /api/v1/auth/google
Installation

Clone repo: git clone <repository-url>
Install dependencies: npm install
Start app: npm start
