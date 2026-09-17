import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getChannelStats = asyncHandler(async (req, res) => {

    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    // Total videos uploaded by channel
    const totalVideos = await Video.countDocuments({
        owner: userId
    });

    // Total subscribers of channel
    const totalSubscribers = await Subscription.countDocuments({
        channel: userId
    });

    // Total views on channel videos
    const totalViews = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                total: {
                    $sum: "$views"
                }
            }
        }
    ]);

    // Total comments made by channel owner
    const totalComments = await Comment.countDocuments({
        owner: userId
    });

    // Total tweets made by channel owner
    const totalTweets = await Tweet.countDocuments({
        owner: userId
    });


    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                totalSubscribers,
                totalViews: totalViews[0]?.total || 0,
                totalComments,
                totalTweets
            },
            "Channel stats fetched successfully"
        )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    /*
find all videos uploaded by an owner or user.by their ID. and do some basic error handling../


    */
    const videos = await Video.find({
        owner: req.user?._id
    }).sort({ createdAt: -1 });

    if (!videos || videos.length === 0) {
        throw new ApiError(404, "No videos found for this channel");
      }

    res.status(200)
        .json(
            new ApiResponse(
                200,
                videos,
                "Channel videos fetched successfully"
            ));
})

export {
    getChannelStats,
    getChannelVideos
}