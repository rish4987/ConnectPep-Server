-authrouter
-POST/ signup
-POST /Login
-POST /logout

profileRouter
-GET/profile/view
-PATCH/profile/edit
-PATCH/profile/password

connectionRequestRouter
-POST/ request/send/interested/:userId
-POST/request/send/ignored/:userId


-POST /request/review/accepted/:requestId
-status : ignore ,interested ,accepted,rejected


userRouter
-GET connections
-GET /requests/received
-GET/feed-Gets you feed of profile


