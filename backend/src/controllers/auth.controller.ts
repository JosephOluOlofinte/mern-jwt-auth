import { z } from "zod";
import catchErrors from "../utils/catchErrors";
import { createAccount, loginUser } from "../services/auth.service";
import { CREATED, OK } from "../constants/http";
import { setAuthCookie } from "../utils/cookies";
import { loginSchema, registerSchema } from "./auth.schemas";



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
        return setAuthCookie({res, accessToken, refreshToken})
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
        return setAuthCookie({res, accessToken, refreshToken}).status(OK).json({
            status: "success",
            message: "You have successfully logged in",
    });
 });