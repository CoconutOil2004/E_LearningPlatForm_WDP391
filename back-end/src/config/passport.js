const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// Guard: nếu thiếu env thì log rõ thay vì crash khó hiểu
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn(
    "⚠️  GOOGLE_CLIENT_ID hoặc GOOGLE_CLIENT_SECRET chưa được cấu hình trong .env — Google OAuth sẽ không hoạt động.",
  );
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            const email = profile.emails[0].value.toLowerCase();
            user = await User.findOne({ email });

            if (user) {
              // Liên kết Google với tài khoản email đã có
              user.googleId = profile.id;
              user.fullname = user.fullname || profile.displayName;
              user.avatarURL = user.avatarURL || profile.photos?.[0]?.value;
              user.isVerified = true;
              await user.save();
            } else {
              // Tạo user mới từ Google
              user = await User.create({
                googleId: profile.id,
                email,
                fullname: profile.displayName,
                avatarURL: profile.photos?.[0]?.value,
                role: "student",
                isVerified: true,
              });
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
