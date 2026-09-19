import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.post(
    "/channels/:channelId/subscribe",
    toggleSubscription
);

router.get(
    "/channels/:channelId/subscribers",
    getUserChannelSubscribers
);

router.get(
    "/users/:subscriberId/subscriptions",
    getSubscribedChannels
);

export default router