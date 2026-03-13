import { getSupabaseAdmin } from "../config/supabase.js";
import { AppError, toErrorResponse } from "../lib/errors.js";
function extractBearerToken(req) {
    const raw = req.header("authorization");
    if (!raw) {
        throw new AppError(401, "UNAUTHORIZED", "Missing bearer token");
    }
    const [scheme, token] = raw.split(" ");
    if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
        throw new AppError(401, "UNAUTHORIZED", "Missing bearer token");
    }
    return token;
}
async function resolveAuthUser(token) {
    // Keep backend auth tests deterministic without requiring live Supabase JWT setup.
    if (process.env.NODE_ENV === "test") {
        if (token.startsWith("test-user:")) {
            const userId = token.slice("test-user:".length);
            if (userId) {
                return { id: userId, email: `${userId}@example.test` };
            }
        }
        throw new AppError(401, "UNAUTHORIZED", "Invalid or expired token");
    }
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
        throw new AppError(401, "UNAUTHORIZED", "Invalid or expired token");
    }
    return {
        id: data.user.id,
        email: data.user.email ?? undefined
    };
}
export async function requireAuth(req, res, next) {
    try {
        const token = extractBearerToken(req);
        const authUser = await resolveAuthUser(token);
        req.auth = {
            userId: authUser.id,
            email: authUser.email
        };
        next();
    }
    catch (error) {
        const payload = toErrorResponse(error);
        res.status(payload.status).json(payload.body);
    }
}
