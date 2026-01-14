import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const configurePassport = () => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.warn("⚠️ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing. Google Auth will not work.");
        return;
    }

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `${process.env.SERVER_URL || "http://localhost:5000"}/api/auth/google/callback`,
            },
            async (accessToken, refreshToken, profile, done) => {
                console.log("Using Callback URL:", `${process.env.SERVER_URL || "http://localhost:5000"}/api/auth/google/callback`);
                try {
                    console.log("Google Profile:", profile);

                    let user = await User.findOne({ email: profile.emails[0].value });

                    if (user) {
                        if (!user.googleId) {
                            user.googleId = profile.id;
                            await user.save();
                        }
                        return done(null, user);
                    } else {
                        user = await User.create({
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            googleId: profile.id,
                        });
                        return done(null, user);
                    }
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};

export default passport;
export { configurePassport };
