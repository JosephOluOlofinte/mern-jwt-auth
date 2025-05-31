import { OK } from "../constants/http";
import SessionModel from "../models/session.model";
import catchErrors from "../utils/catchErrors";


export const getSessionsHandler = catchErrors(

    async (req, res) => {

        const sessions = await SessionModel.find({
          userId: req.userId,
          expiresAt: { $gt: new Date() },
        },
        {
            _id: 1, 
            userAgent: 1,
            expiresAt: 1,
        },
        {
            sort: { createdAt: -1 }
        });

        return res.status(OK).json(
            sessions.map((session) => ({
                ...session.toObject(),
                ...(
                    session._id === req.sessionId && {
                        isCurrent: true,
                    }
                )
            }))
        )
    }
)