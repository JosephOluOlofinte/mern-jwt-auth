import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import jwt from "jsonwebtoken";
import VerificationCodeType from "../constants/verificationCodeTypes";
import sessionModel from "../models/session.model";
import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verificationCode.model";
import { oneYearFromNow } from "../utils/date";

export type CreateAccountParams = {
    email: string;
    name: string;
    password: string;
    userAgent?: string;
}

export const createAccount = async(data:CreateAccountParams) => {

  // verify if the user already exists using the email address
  const existingUser = await UserModel.exists({
    email: data.email,
  });

  // if the user exists, throw an error
  if (existingUser) {
    throw new Error("User already exists with this email address");
  } 

  // else, create a new user
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