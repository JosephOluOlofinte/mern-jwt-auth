

type Params = {
    to: string;
    subject: string;
    text: string;
    html: string;
}

export const sendMail = async (
    {
        to, subject, text, html
    }:Params
) => 