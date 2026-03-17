const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
  console.warn(
    "⚠️ GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET hoặc GOOGLE_CALLBACK_URL chưa được cấu hình trong .env — Google OAuth sẽ không hoạt động.",
  );
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();

          if (!email) {
            return done(new Error("Google account does not provide email"), null);
          }

          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            user = await User.findOne({ email });

            if (user) {
              if (user.action === "lock") {
                return done(
                  new Error("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên."),
                  null,
                );
              }

              user.googleId = profile.id;
              user.fullname = user.fullname || profile.displayName;
              user.avatarURL = user.avatarURL || profile.photos?.[0]?.value;
              user.isVerified = true;
              user.mustChangePassword = false; // Google login bypasses temp password

              if (!user.username) {
                user.username = email.split("@")[0] + "_" + Date.now();
              }

              await user.save();
            } else {
              user = await User.create({
                googleId: profile.id,
                email,
                fullname: profile.displayName || "",
                username: email.split("@")[0] + "_" + Date.now(),
                avatarURL: profile.photos?.[0]?.value || "",
                role: "student",
                isVerified: true,
                mustChangePassword: false,
              });
            }
          } else {
            if (user.action === "lock") {
              return done(
                new Error("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên."),
                null,
              );
            }

            let needSave = false;

            if (!user.fullname && profile.displayName) {
              user.fullname = profile.displayName;
              needSave = true;
            }

            if (!user.avatarURL && profile.photos?.[0]?.value) {
              user.avatarURL = profile.photos[0].value;
              needSave = true;
            }

            if (!user.username) {
              user.username = email.split("@")[0] + "_" + Date.now();
              needSave = true;
            }

            if (!user.isVerified) {
              user.isVerified = true;
              needSave = true;
            }

            if (user.mustChangePassword) {
              user.mustChangePassword = false;
              needSave = true;
            }

            if (needSave) {
              await user.save();
            }
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      },
    ),
  );
}

module.exports = passport;