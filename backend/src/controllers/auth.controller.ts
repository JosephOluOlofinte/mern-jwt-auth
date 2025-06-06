import { z } from "zod";
import catchErrors from "../utils/catchErrors";
import { createAccount, loginUser, refreshUserAccessToken, resetPassword, sendPasswordResetEmail, verifyEmail } from "../services/auth.service";
import { CREATED, OK, UNAUTHORIZED } from "../constants/http";
import { clearAuthCookies, getAccessTokenCookieOptions, getRefreshTokenCookieOptions, setAuthCookies } from "../utils/cookies";
import { emailSchema, loginSchema, registerSchema, resetPasswordSchema, verificationCodeSchema } from "./auth.schemas";
import { verifyToken } from "../utils/jwt";
import SessionModel from "../models/session.model";
import appAssert from "../utils/appAssert";



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
   const accessToken = req.cookies.accessToken as string | undefined;
   const { payload } = verifyToken(accessToken || "");

   if (payload) {
    // grab sessionID and delete from db
    await SessionModel.findByIdAndDelete(payload.sessionId);
   }

    // clear cookies
    clearAuthCookies(res);
    return res.status(OK).json({
        status: "success",
        message: "You have successfully logged out!",
    });
 });

 export const refreshHandler = catchErrors(async (req, res) => {
    const refreshToken = req.cookies.refreshToken as string | undefined;
    appAssert(refreshToken, UNAUTHORIZED, "Refresh token is missing");

    const {accessToken, newRefreshToken} = await refreshUserAccessToken(refreshToken);

    if (newRefreshToken) {
      res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());
    }

    return res.status(OK).cookie("accessToken", accessToken, getAccessTokenCookieOptions()).json({
        status: "success",
        message: "Access token refreshed successfully!",
 });
});

export const verifyEmailHandler = catchErrors(async (req, res) => {
    // validate the request
    const verificationCode = verificationCodeSchema.parse(req.params.code);

    await verifyEmail(verificationCode);
    return res.status(OK).json({
        status: "success",
        message: "Email successfully verified!",
    });
});

export const sendPasswordResetHandler = catchErrors(async (req, res) => {
    const email = emailSchema.parse(req.body.email);

    // call the service
    await sendPasswordResetEmail(email);

    return res.status(OK).json({
        status: "success",
        message: "Password reset email sent"
    })
});

export const resetPasswordHandler = catchErrors(async (req, res) => {
    const request = resetPasswordSchema.parse(req.body);

    // call the service
    await resetPassword(request);

    clearAuthCookies(res);
    return res.status(OK).json({
        status: "success",
        message: 'Password reset successful',
    });
});