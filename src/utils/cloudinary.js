import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary file upload
const uploadOnCloudinary = async (localFilePath) => {
    try {
        // if no local file then return null
        if (!localFilePath) return null;

        // upload the file on cloudinary
        const fileUploadResponse = await cloudinary.uploader.upload(
            localFilePath,
            { resource_type: "auto" }
        );

        // file has been uploaded successfully
        console.log("File is uploaded on cloudinary! " + fileUploadResponse.url);

        // return the file upload response
        return fileUploadResponse;
    } catch (error) {
        // remove the locally saved temporary file as the upload operation got failed!
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export { uploadOnCloudinary };