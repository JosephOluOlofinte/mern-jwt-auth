import { z } from "zod";
import catchErrors from "../utils/catchErrors";
import { createAccount } from "../services/auth.service";
import { CREATED } from "../constants/http";
import { setAuthCookie } from "../utils/cookies";

const registerSchema = z.object({
    name: z.string().min(1).max(255),
    email: z.string().email().min(1).max(255),
    password: z.string().min(6).max(255),
    confirmPassword: z.string().min(6).max(255),
    userAgent: z.string().optional(),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match", 
        path: ["confirmPassword"], 
    }
)


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
       

        // call the service to login the user

        // return a response
    })