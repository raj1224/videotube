import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js";



const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!name || !description) {
        throw new ApiError(400, "name or description not found so cannot create playlist");
    }

    //TODO: create playlist , each playlist will have a name , description , an owner and some videos

    const playlist = await Playlist.create({
        name: name,
        description: description,
        owner: req.user?._id,
    })

    if (!playlist) {
        throw new ApiError(404, "playlist not found");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            playlist,
            "playlist created successfully."
            )
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if (!userId) {
        throw new ApiError(404, "userId is not defined while fetching user playlists");
    }
    const playlist = await Playlist.find(
        { owner: userId }
    )
    if (playlist.length === 0) {
        throw new ApiError(404, "playlist is not present when fetching all user playlists");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "fetched user playlist successfully"
        )
    );

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!playlistId) {
        throw new ApiError(404, "playlist id not defined");
    }
    const playlist = await Playlist.findById(playlistId).populate("videos");
    if (!playlist) {
        throw new ApiError(400, "playlist is not present while fetching id");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "playlist fetched successfully"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !videoId) {
        throw new ApiError(
            400,
            "playlist id or video id not found"
        );
    }

    if (!mongoose.isValidObjectId(playlistId) ||
        !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }

    const videoExists = await Video.exists({
        _id: videoId
    });

    if (!videoExists) {
        throw new ApiError(404, "Video not found");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {
                videos: videoId
            }
        },
        { new: true }
    );

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Video added to playlist successfully"
        )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    /*
    find the playlist by playlist id and find the video by videoID.
    basic error handling
    check if video exists.
    remove the videos found by video id and send the response.

    */
    const videoExists = await Video.exists({ _id: videoId });
 if (!videoExists) {
     throw new ApiError(404, "Video not found");
    }
    if (!playlistId || !videoId) {
        throw new ApiError(404, "playlist id or video id not found");
    }
    const removedVideoFromPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
        $pull: {
            videos: videoId
        }
    },
    { new: true }
);
    if (!removedVideoFromPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            removedVideoFromPlaylist,
            "video successfully removed from the playlist"
        )
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!playlistId) {
        throw new ApiError(404, "playlist id not defined when deleting playlist");
    }
    const playlist = await Playlist.findByIdAndDelete(playlistId);
    if (!playlist) {
        throw new ApiError(400, "playlist is not defined when deleting it or playlist not found");
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "deleted playlist successfully"
        )
    );
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!playlistId || !name || !description) {
        throw new ApiError(400, "either the playlist id is not defined or name or description");
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
        403,
        "You are not allowed to modify this playlist"
    );
}
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
           $set: {
    name,
    description
}
        },
        {new :true}
    )
    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "upldated playlist successfully"
        )
    );
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}