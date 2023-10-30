const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 4000;

//database connect
database.connect();
// middleware
app.use(express.json());
app.use(cookieParser());
// for connecting frontend from backend
app.use(
  cors({


    origin:"http://localhost:3000",

    
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
  })
);

// for cloudianry
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);
// cloudianry connection
cloudinaryConnect();

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/auth/profile", profileRoutes);
app.use("/api/v1/auth/course", courseRoutes);
app.use("/api/v1/auth/payment", paymentRoutes);

// default route
app.get("/", (req, res) => {
  return res.json({
    successs: true,
    message: "Your server is up and running....",
  });
});

//server start
app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
