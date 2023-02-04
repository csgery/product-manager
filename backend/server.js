import { makeExecutableSchema } from "@graphql-tools/schema";
import { applyMiddleware } from "graphql-middleware";
import { GraphQLError } from "graphql";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import express from "express";
import http from "http";
import session from "express-session";
//import cookieParser from "cookie-parser";
import connectRedis from "connect-redis";
import { createClient } from "redis";
import cors from "cors";
import bodyParser from "body-parser";

import jwt from "jsonwebtoken";
import { expressjwt } from "express-jwt";

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

import permissions from "./graphql/permissions.js";
import typeDefs from "./graphql/schema/index.js";
import resolvers from "./graphql/resolvers/index.js";

import User from "./models/user.js";
import {
  userExpiredAccessJWT_Error,
  userExpiredRefreshJWT_Error,
} from "./helper/errors/userErrors.js";

const port = process.env.PORT || 3000;

const app = express();
const httpServer = http.createServer(app);
const RedisStore = connectRedis(session);
let redisClient = createClient({ legacyMode: true });
redisClient.connect().catch(console.error);

console.time("server-starting-time2");

const server = new ApolloServer({
  schema: applyMiddleware(
    makeExecutableSchema({ typeDefs, resolvers }),
    permissions
  ),
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  cors: {
    origin: "*",
    credentials: true,
  },
});
await server.start();
//server.applyMiddleware({ app });

app.set("trust proxy", process.env.NODE_ENV !== "production");

// enable cors
var corsOptions = {
  // origin: "http://localhost:4000",
  origin: "*",
  // credentials: true, // <-- REQUIRED backend setting
};
app.use(cors(corsOptions));

// app.use(
//   cors({
//     credentials: true,
//     origin: "*",
//   })
// );

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// app.use(
//   session({
//     name: "qid",
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
//     },
//   })
// );

app.use(
  "/graphql",

  bodyParser.json(),
  // expressjwt({
  //   // secret: process.env.JWT_SECRET,
  //   secret: process.env.JWT_ACCESSSECRET,
  //   algorithms: ["HS256"],
  //   credentialsRequired: false,
  // }),
  // expressMiddleware accepts the same arguments:
  // an Apollo Server instance and optional configuration options
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      //console.log("request:", req);

      let userFromToken = null;
      const authHeader = req.headers.authorization;
      // const refreshHeader = req.headers.refreshtoken;
      if (!authHeader) {
        console.log("no header");
        // console.log(req.headers);
        return;
      }
      const accessToken = authHeader.split(" ")[1] || "";
      // const refreshToken = refreshHeader;

      //console.log(refreshHeader);

      let verifiedTokenData = null;

      try {
        verifiedTokenData = jwt.verify(
          accessToken,
          process.env.JWT_ACCESSSECRET
        );
      } catch (err) {
        // TODO:throw GQLError(in the permissions file!!! not here) and handle in client side
        // if the access token has expired
        if (err.message === "jwt expired") {
          console.log("access token expired");
          // return the user context and check in the permissions file
          return { user: { expiredAccessToken_Redirect: true }, req };
        }
        if (err.message === "jwt must be provided") {
          console.log("there is no access token or wrong format");
          // console.log(authHeader);
          return;
        }
        console.log(err);
        return;
      }

      // it can cause an interesting thing, because if we have a valid accessToken, and we DONT HAVE a refresh token then we return without setting the user context -> we are not authenticated.
      // But it is not a problem, because something is not right if we have an access token BUT dont have a refresh token...
      // if (!refreshToken) {
      //   console.log("no refresh token");
      //   return;
      // }

      // if (verifiedTokenData === null) {
      //   try {
      //     verifiedTokenData = jwt.verify(
      //       refreshToken,
      //       process.env.JWT_REFRESHSECRET
      //     );
      //   } catch (err) {
      //     // if the refresh token has expired
      //     if (err.message === "jwt expired") {
      //       console.log("refresh token expired");
      //       // return the user context and check in the permissions file
      //       return { user: { expiredRefreshToken: true } };
      //     }
      //     console.log(err);
      //     return;
      //   }
      // }

      userFromToken = verifiedTokenData;
      console.log("TOKEN CFT:", userFromToken[process.env.JWT_TOKEN_SCOPE].CFT);
      const userFromDB = await User.findById(userFromToken.sub);
      // CFT = Counter For Token
      if (
        !userFromDB ||
        userFromDB.CFT !== userFromToken[process.env.JWT_TOKEN_SCOPE].CFT
      ) {
        console.log("current CFT:", userFromDB.CFT);
        console.log(
          "tokens CFT:",
          userFromToken[process.env.JWT_TOKEN_SCOPE].CFT
        );
        // return to (permissions file)(?) and check there
        // redirecting and try to get a new acces token from refresh token is not a good idea here, because at this point the refresh token is invalid too
        return { user: { expiredAccessToken_ReLogin: true } };
      }

      return { user: userFromToken, req, res };
    },
  })
);

try {
  console.log("Connecing to MongoDB...");
  mongoose.set("debug", process.env.NODE_ENV === "development");
  await mongoose.connect(process.env.MDB_URI, { autoIndex: true });
  await new Promise((resolve) => httpServer.listen({ port: port }, resolve));
  console.log(`🚀 Server ready at ${process.env.BACKEND_URI}/`);
} catch (err) {
  console.log(err);
}

console.timeEnd("server-starting-time2");
