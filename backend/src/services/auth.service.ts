
export type CreateAccountParams = {
    email: string;
    name: string;
    password: string;
    userAgent?: string;
}

export const createAccount = async(data:CreateAccountParams) => {
    // verify if the user already exists using the email address

    // if the user exists, throw an error

    // else, create a new user

    // create a verification code

    // send a verification email

    // create a new session

    // sign access and refresh tokens

    // return the user and tokens
}