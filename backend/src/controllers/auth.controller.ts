import { z } from "zod";
import catchErrors from "../utils/catchErrors";
import { createAccount, loginUser } from "../services/auth.service";
import { CREATED, OK } from "../constants/http";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies";
import { loginSchema, registerSchema } from "./auth.schemas";
import { verifyToken } from "../utils/jwt";
import SessionModel from "../models/session.model";



export const registerHandler = catchErrors(
    async (req, res) => {

        // validate the request body
        const request = registerSchema.parse({
            ...req.body,
            userAgent: req.headers["user-agent"],
        });

        // call the service to register the user
        const {user, accessToken, refreshToken} = await createAccount(request);
        

        // return a response
        return setAuthCookies({res, accessToken, refreshToken})
        .status(CREATED).json({
            status: "success",
            message: "User created successfully",
            user
        })
    }
)

export const loginHandler = catchErrors(
    async (req, res) => {
        // validate the request body
       const request = loginSchema.parse(
            {
                ...req.body,
                userAgent: req.headers["user-agent"],
            }
       )

        // call the service to login the user
        const { accessToken, refreshToken } = await loginUser(request);


        // return a response
        return setAuthCookies({res, accessToken, refreshToken}).status(OK).json({
            status: "success",
            message: "You have successfully logged in",
    });
 });

 export const logoutHandler = catchErrors(async (req, res) => {
   const accessToken = req.cookies.accessToken;
   const { payload } = verifyToken(accessToken);

   if (payload) {
    // grab sessionID and delete from db
    await SessionModel.findByIdAndDelete(payload.sessionId);
   }

    // clear cookies
    clearAuthCookies(res);
    return res.status(OK).json({
        status: "success",
        message: "You have successfully logged out",
    });
 });