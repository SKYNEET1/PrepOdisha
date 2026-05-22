const mongoose = require("mongoose");
const Category = require("./models/Category");
const Course = require("./models/Course");
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env.development")
});

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        const categories = await Category.find().populate("courses");
        console.log("Categories found:", categories.length);
        categories.forEach(cat => {
            console.log(`Category: ${cat.name}, Courses: ${cat.courses.length}`);
            cat.courses.forEach(c => console.log(` - ${c.courseName} (Status: ${c.status})`));
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
