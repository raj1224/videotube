import mongoose,{isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {

    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const videoComments = await Comment.aggregate([
        // 1. Video ke comments filter karo
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },

        // 2. Comment owner ki information lao
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },

        // 3. ownerDetails array ko single object banao
        {
            $addFields: {
                commenterOfVideo: {
                    $arrayElemAt: ["$ownerDetails", 0]
                }
            }
        },

        // 4. Newest comments first
        {
            $sort: {
                createdAt: -1
            }
        },

        // 5. Pagination
        {
            $skip: skip
        },

        {
            $limit: parseInt(limit)
        },

        // 6. Sirf required data bhejo
        {
            $project: {
                content: 1,
                createdAt: 1,
                owner: 1,
                "commenterOfVideo.username": 1,
                "commenterOfVideo.avatar": 1
            }
        }
    ]);

    if (videoComments.length === 0) {
        throw new ApiError(
            404,
            "No comments found for this video"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            videoComments,
            "Video comments fetched successfully"
        )
    );
});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;

    if (!videoId) {
        throw new ApiError(400, "video id is not found while adding a comment");
    }
    const newComment = await Comment.create({
        content: content,
        video: videoId,
        owner:req?.user._id
    })
    if (!newComment) {
        throw new ApiError(500, "comment not found ");
    }
    return res.status(201).json(
        new ApiResponse(
            201,
            { newComment },
            "comment added"
        )
    )

})

const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { commentId } = req.params;
    const userId = req.user?._id;

    if (!commentId) {
        throw new ApiError(400, "comment id not defined");
    }

    // Pehle comment find karo
    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "comment not found");
    }

    // Check: kya current user hi comment ka owner hai?
    if (comment.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "you are not allowed to update this comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content
            }
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedComment,
            "comment updated successfully"
        )
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user?._id;

    if (!commentId) {
        throw new ApiError(400, "comment id not defined");
    }

    // Comment find karo
    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "comment not found");
    }

    // Ownership check
    if (comment.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "you are not allowed to delete this comment");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(
        new ApiResponse(
            200,
            deletedComment,
            "comment deleted successfully"
        )
    );
});

export {
    getVideoComments,
    addComment,
    updateComment,
     deleteComment
    }