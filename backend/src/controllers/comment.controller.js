import mongoose,{isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const { page = 1, limit = 10 } = req.query;
    const  userId  = req.user?._id;

    /*
 /**
 * 💬 GET VIDEO COMMENTS -->
 *
 * 🧠 What this does:
 *    - Gets all comments for a given video
 *    - Adds commenter info (username, avatar)
 *    - Supports pagination (with skip & limit)
 *
 * 🔁 Aggregation Breakdown:
 *
 * 1. 🎯 Match: Filter comments only for the given video ID
 *
 * 2. 🤝 Lookup: Join each comment with its owner's user data
 *    - Only grab username and avatar to keep it light
 *
 * 3. 🔨 AddFields: Flatten the joined user array into a single object
 *    - Easier to access on frontend
 *
 * 4. 📅 Sort: Sort comments by most recent first (createdAt descending)
 *
 * 5. ⏭ Skip: Skip comments based on the current page (pagination)
 *
 * 6. 🎯 Limit: Limit the number of comments returned per page
 *
 * 7. 📦 Project: Send only the useful fields to frontend
 *    - content, createdAt, owner ID, and commenter info
 */
    const skip = (page - 1) * limit;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const videoComments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
            }

        },
        {
            $lookup: {
                from: "users",
                localField:"owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                commenterOfVideo: {
                 $first:"ownerDetails"
                }
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
            $project: {
                commenterOfVideo: 1,
                content: 1,
                owner:1
            }
        }
    ])

    if (!videoComments || videoComments.length ===0) {
        throw new ApiError(404,
            "video comments not found while getting video comments"
        )
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            videoComments,
            "video comments fetched successfully"
        )
    )

})

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