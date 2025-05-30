

/**
 * Asserts that a given condition is true.
 * If the condition is false, it throws an error with the provided message.
 */

import assert from "node:assert"
import AppError from "./AppError"
import { HttpStatusCode } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";



type AppAssert = (
    condition: any,
    httpStatusCode: HttpStatusCode,
    message: string,
    appErrorCode?: AppErrorCode
) => asserts condition;


const appAssert: AppAssert = (
    condition, 
    httpStatusCode,
    message,
    appErrorCode
) => assert(condition, new AppError(httpStatusCode, message, appErrorCode));


export default appAssert;