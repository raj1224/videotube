import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {

    const {
        page = 1,
        limit = 10,
        query = "",
        sortBy = "createdAt",
        sortType = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const videos = await Video.aggregate([
        // 1. Search/filter videos by title
        {
            $match: {
                title: {
                    $regex: query,
                    $options: "i"
                },
                isPublished: true
            }
        },

        // 2. Get video owner's details
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "videosByOwner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },

        // 3. Convert owner array into object
        {
            $addFields: {
                userVids: {
                    $first: "$videosByOwner"
                }
            }
        },

        // 4. Sort
        {
            $sort: {
                [sortBy]: sortType === "desc" ? -1 : 1
            }
        },

        // 5. Pagination
        {
            $skip: skip
        },

        {
            $limit: parseInt(limit)
        },

        // 6. Fields to send to frontend
        {
            $project: {
                videoFile: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                thumbnail: 1,
                userVids: 1,
                createdAt: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            videos.length
                ? "All videos fetched successfully"
                : "No videos found"
        )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(404, "title, description are needed");
  }

  // TODO: get video, upload to cloudinary, create video
  /*
 get title desc from body
 find videoLocal path :
 find thumbnailLocal path.
 delete old thumbnail and delete old video. #TODO.
 upload them to cloudinary
 create new video with fields and return the response.
    */
  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(
      404,
      "videoLocal path or thumbnail local path is not present"
    );
  }

  let video = await uploadOnCloudinary(videoLocalPath);

  let uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!video || !uploadedThumbnail) {
    throw new ApiError(
      500,
      "Failed to upload video or thumbnail to Cloudinary."
    );
  }

  const newVideo = await Video.create({
    title: title,
    description: description,
    videoFile: video.url,
    thumbnail: uploadedThumbnail.url,
    owner: req.user?._id,
    duration: video.duration,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newVideo, "Video published successfully."));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  //`populate("owner", "name email")` fetches additional details about the video's owner.
  //   - Instead of just storing the owner's ID, this will return their name and email too.
  const video = await Video.findById(videoId).populate("owner", "username email");
  if (!video || !videoId) {
    throw new ApiError(400, "video not found or video id doesnt exist.");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  //TODO: update video details like title, description, thumbnail

  /*

   find video id by params. get title and description from body
   do some basic error handling
   find thumbnail path and upload to cloudinary
   delete old thumbnail #TODO
   update the url and other values and send response
    */
  if (!title || !description) {
    throw new ApiError(404, "title and description needed");
  }

  if (!videoId) {
    throw new ApiError(500, "video id doesnt exist.");
  }
  // add error handling for thumbnail../
  const thumbnailLocalPath = req.file?.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(404, "thumbnail path undefined.");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail.url) {
    throw new ApiError(400, "error uploading thumbnail to cloudinary");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: thumbnail.url,
        title: title,
        description: description,
        owner: req.user?._id,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId) {
    throw new ApiError("404", "video id not defined");
  }
  const deletedVideo = await Video.findByIdAndDelete(videoId);
  if (!deletedVideo) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(204)
    .json(new ApiResponse(204, deletedVideo, "Video deleted successfully."));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  if (!video || !videoId) {
    throw new ApiError(400, "video not found or video id doesnt exist.");
  }
  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, video, "toggled their published status"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};