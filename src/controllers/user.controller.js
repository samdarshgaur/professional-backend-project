import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // 1. get user details from frontend
    const { fullname, email, username, password } = req.body;
    console.log("email: ", email);

    // 2. validation (field should not be empty)
    if (
        [fullname, email, username, password].some(field => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // 3. check if user already exists: username, email
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    });
    if (existedUser) {
        throw new ApiError(409, "username or email already exists");
    }

    // 4. check for images, check for avatar
    // avatar and cover image are locally stored and not uploaded to cloudinary for now
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // check if avatar local path exists or not
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // 5. upload them to cloudinary, avatar
    const avatarOnCloudinary = await uploadOnCloudinary(avatarLocalPath);
    const coverImageOnCloudinary = await uploadOnCloudinary(coverImageLocalPath);
    // check if avatar uploaded on cloudinary or not
    if (!avatarOnCloudinary) {
        throw new ApiError(400, "Avatar file is required");
    }

    // 6. create user object - create entry in db
    const userCreatedInDb = await User.create({
        fullname,
        avatar: avatarOnCloudinary.url,
        coverImage: coverImageOnCloudinary?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    // 7. find user in db and remove password and refresh token field from response
    const userFoundInDb = await User.findById(userCreatedInDb._id).select(
        "-password -refreshToken"
    );

    // 8. check for user creation in db, if not found throw error
    if (!userFoundInDb) {
        throw new ApiError(500, "User not found. Something went wrong while registering the user");
    }

    // 9. return response
    return res.status(201).json(
        new ApiResponse(200, userFoundInDb, "User registered successfully!")
    );

});

export { registerUser };