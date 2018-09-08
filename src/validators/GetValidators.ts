import { Blogs } from "../database/BlogsModel";
import { IExtendedRequest } from "../routes/IExtendedRequest";
import * as express from 'express';

export class GetValidators {

    static async isLoggedAndConfigured(req: IExtendedRequest, res: express.Response, next: express.NextFunction) {

        try {
            if (!req.session.steemconnect) throw new Error("User not logged in");
            let blogger = await Blogs.findOne({ steem_username: req.session.steemconnect.name });
            if (!blogger) throw new Error("Blogger not found");
            req.session.blogger = blogger;
            if (!blogger.tier) res.redirect('/configure');
            if (!blogger.configured) {
                if (req.path == '/configure') {
                    return next();
                } else {
                    res.redirect('/dashboard/configure');
                }
            } else {
                return next();
            }

        } catch (error) {
            res.redirect('/');
        }
    }
}
