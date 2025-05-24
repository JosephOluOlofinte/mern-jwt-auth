import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import jwt from "jsonwebtoken";
import VerificationCodeType from "../constants/verificationCodeTypes";
import sessionModel from "../models/session.model";
import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verificationCode.model";
import { oneYearFromNow } from "../utils/date";
import appAssert from "../utils/appAssert";
import { CONFLICT } from "../constants/http";

export type CreateAccountParams = {
    email: string;
    name: string;
    password: string;
    userAgent?: string;
}

export const createAccount = async(data:CreateAccountParams) => {

  // verify if the user already exists and throw error
  const existingUser = await UserModel.exists({
    email: data.email,
  });

  appAssert(!existingUser, CONFLICT, "Email already exists");


  // create a new user
    const user = await UserModel.create({
        email: data.email,
        name: data.name,
        password: data.password,
    });


  // create a verification code
    const verificationCode = await VerificationCodeModel.create({
        userId: user._id,
        type: VerificationCodeType.EmailVerification,
        expiresAt: oneYearFromNow(),
    })

  // send a verification email

  // create a new session
  const session = await sessionModel.create({
    userId: user._id,
    userAgent: data.userAgent,
  })
  

  // sign access and refresh tokens
  const refreshToken = jwt.sign(
    { 
      session: session._id 
    },
    JWT_REFRESH_SECRET,
    { 
      audience: ['user'],
      expiresIn: "30d" 
    },
  );

  const accessToken = jwt.sign(
    {
      userId: user._id,
      session: session._id,
    },
    JWT_SECRET,
    {
      audience: ["user"],
      expiresIn: "15m",
    }
  );

  // return the user and tokens
  return {
    user,
    accessToken,
    refreshToken,
  };
};