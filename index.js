const connectToMongo = require("./db");
const express = require("express");
const User = require("./models/User");
var cors = require("cors");
require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;

const clientSecret = "";

connectToMongo();
const app = express();
const port = process.env.PORT;
app.use(express.json());
app.use(cors());

//! GOOGLE AUTH CONFIGURATIONS START
app.use(
    session({
      secret: "1234ksdvb",
      resave: false,
      saveUninitialized: true,
    })
  );
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new OAuth2Strategy(
    {
      clientID: "630232520256-v4qbj32vtjahd7m0tltb7f0u26nebrj4.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:5000/api/auth/google/callback",
      scope:["profile","email"],
    },
    async (request, accessToken, refreshToken, profile, done) => {
        console.log("profile",profile)
      try {
        let user = await User.findOne({ googleId: profile.id });
        console.log(profile);
        if (!user) {
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.email,
          });
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
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
  } catch (error) {
    done(error, false);
  }
});

//! GOOGLE AUTH CONFIGURATIONS END

// AVAILABLE ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/gpa", require("./routes/auth"));
app.use("/api/semester", require("./routes/semester"));
app.use("/api/subject", require("./routes/subject"));
app.use("/api/exam", require("./routes/exam"));

app.listen(port, () => {
  console.log(`Scholix backend listening on port ${port}`);
});
