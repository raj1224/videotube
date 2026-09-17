import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // const { LikeId } = req.body;
    const userId = req.user?._id;
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    if (!videoId || !userId)  {
        throw new ApiError(400, "video id or userId not found while toggling");
    }
    const likedVideos = await Like.findOne({
        video: videoId,
        likedBy:userId
    })
    if (likedVideos) {
        await Like.deleteOne({
            video: videoId,
            likedBy: userId
        });
        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "deleted video like"
            )
        )
    }
    else {
        await Like.create({
            video: videoId,
            likedBy:userId
        })
        return res.status(201).json(
            new ApiResponse(
                201,
                {},
                "added video like"
            )
        )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user?._id;
    //TODO: toggle like on video
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    if (!commentId || !userId)  {
        throw new ApiError(400, "comment id or userId not found while toggling");
    }
    //TODO: toggle like on comment
    const likedComments = await Like.findOne({
        comment: commentId,
        likedBy:userId
    })
    if (likedComments) {
        await Like.deleteOne({
            comment: commentId,
            likedBy: userId
        });
        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "deleted comment like"
            )
        )
    }
    else {
        await Like.create({
            comment: commentId,
            likedBy:userId
        })
        return res.status(201).json(
            new ApiResponse(
                201,
                {},
                "added comment like"
            )
        )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const userId = req.user?._id;
    //TODO: toggle like on video
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    if (!tweetId || !userId)  {
        throw new ApiError(400, "tweet id or userId not found while toggling");
    }
    //TODO: toggle like on comment
    const likedTweets = await Like.findOne({
        tweet: tweetId,
        likedBy:userId
    })
    if (likedTweets) {
        await Like.deleteOne({
            tweet: tweetId,
            likedBy: userId
        });
        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                "deleted tweet like"
            )
        )
    }
    else {
        await Like.create({
            tweet: tweetId,
            likedBy:userId
        })
        return res.status(201).json(
            new ApiResponse(
                201,
                {},
                "added tweet like"
            )
        )
    }
}
)

//#TODO
const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user?._id
    /*
 -> find all likes by user related to videos. ensure that video exists.. and populate the likedVidoes for more details needed.

    */
    if (!userId) {
        throw new ApiError(404, "userid not defined so cant get liked videos");
    }
    const likedVideos = await Like.find({
        likedBy: userId,
        video: { $exists: true }
    }).populate("video", "title thumbnail videoFile duration views")

    if (likedVideos.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "No liked videos found"));
    }

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "liked videos fetched successfully")
    );
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}