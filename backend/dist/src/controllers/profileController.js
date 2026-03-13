import { z } from "zod";
import { AppError, toErrorResponse } from "../lib/errors.js";
import { getCurrentProfile, updateCurrentProfile } from "../services/profileService.js";
const UpdateProfileSchema = z
    .object({
    name: z.string().min(1).max(80).optional(),
    bio: z.string().max(500).optional(),
    email: z.string().email().optional(),
    location: z.string().max(120).optional(),
    avatar_url: z.string().url().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional()
})
    .refine((value) => (value.latitude === undefined) === (value.longitude === undefined), {
    message: "latitude and longitude must be provided together"
})
    .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
});
function requireAuthContext(req) {
    if (!req.auth) {
        throw new AppError(401, "UNAUTHORIZED", "Missing bearer token");
    }
    return req.auth;
}
export async function handleGetMeProfile(req, res) {
    try {
        const auth = requireAuthContext(req);
        const data = await getCurrentProfile(auth.userId, auth.email);
        res.status(200).json({
            code: "OK",
            message: "Profile fetched",
            data
        });
    }
    catch (error) {
        const payload = toErrorResponse(error);
        res.status(payload.status).json(payload.body);
    }
}
export async function handleUpdateMeProfile(req, res) {
    try {
        const auth = requireAuthContext(req);
        const normalizedBody = { ...req.body };
        if (typeof normalizedBody.email === "string" && normalizedBody.email.trim() === "") {
            delete normalizedBody.email;
        }
        const body = UpdateProfileSchema.parse(normalizedBody);
        const data = await updateCurrentProfile({
            authUserId: auth.userId,
            authEmail: auth.email,
            ...body
        });
        res.status(200).json({
            code: "OK",
            message: "Profile updated",
            data
        });
    }
    catch (error) {
        const payload = toErrorResponse(error);
        res.status(payload.status).json(payload.body);
    }
}
