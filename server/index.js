const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config({
  path: process.env.NODE_ENV === "development" ? path.join(__dirname, ".env.development") : path.join(__dirname, ".env")
});

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");
const aiRoutes = require("./routes/AI");
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const PORT = process.env.PORT || 4000;

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:4002"],
		credentials: true,
	})
)

app.use(
	fileUpload({
		useTempFiles: true, 
		tempFileDir: "/tmp",
	})
)
//cloudinary connection
cloudinaryConnect();

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);
app.use("/api/v1/ai", aiRoutes);

// Heart Beat of server
app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: 'Your server is up and running....'
	});
});

(async () => {
	await database.connect();
	app.listen(PORT, () => {
		console.log(`🚀 Server running at PORT ${PORT}`);
	});
})();

