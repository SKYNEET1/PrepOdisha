const cloudinary = require('cloudinary').v2
const fs = require('fs').promises

exports.uploadImageToCloudinary  = async (file, folder, height, quality) => {
    const options = {folder};
    if(height) {
        options.height = height;
    }
    if(quality) {
        options.quality = quality;
    }
    options.resource_type = "auto";

    try {
        const result = await cloudinary.uploader.upload(file.tempFilePath, options);
        return result;
    } finally {
        // Optimal clean up of local temporary file to avoid disk storage leaks
        try {
            if (file && file.tempFilePath) {
                await fs.unlink(file.tempFilePath);
            }
        } catch (error) {
            console.error("Error while removing temporary file: ", error);
        }
    }
}