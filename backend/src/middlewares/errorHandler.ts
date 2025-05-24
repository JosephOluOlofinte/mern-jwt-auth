import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import { z } from "zod";
import AppError from "../utils/AppError";


const handleZodError = (res: Response, error: z.ZodError) => {
  const errors = error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message
  }))


  return res.status(BAD_REQUEST).json({
    status: "Error",
    message: error.message,
    errors
})
}

const handleAppError = (res: Response, error: AppError) => {
  return res.status(error.statusCode).json({
    status: "Error",
    message: error.message,
    code: error.errorCode
  });
};

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    console.log(`PATH: ${req.path}`, error);

    if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        handleZodError(res, error);
        return;
    }

    if (error instanceof AppError) {
      handleAppError(res, error);
      return;
    }
    

    res.status(INTERNAL_SERVER_ERROR).json({
      status: "Error",
      message: "Internal server error"
    });
    return;
}

export default errorHandler;