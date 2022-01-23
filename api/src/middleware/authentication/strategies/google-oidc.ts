import express from "express";
import type { Session } from "express-session";
import passport from "passport";
import { getOrCreateFederatedUser } from "../../../models";
import config from "../../../config";

// No @types yet :(
const OIDCStrategy = require("passport-openidconnect");


export class GoogleOIDCStrategy extends OIDCStrategy {
    name: string;

    constructor(options: Record<string,any>, verify: CallableFunction) {
        super({
            ...config.oidc.google,
            ...options
        }, verify);
        this.name = "google";
    }

    authenticate(req: Express.Request, opts?: Record<string,any>) {
        super.authenticate(req, opts);
    }
}


export const googleOIDCStrategy = new GoogleOIDCStrategy(
    {
        // callbackURL: "/oauth2/redirect/accounts.google.com",
        scope: ["profile"],
        // state: true,
    },
    (issuer: string, profile: Record<string,any>, done: CallableFunction) => {
        return getOrCreateFederatedUser(issuer, profile.id, profile.displayName, done);
    }
);

export const googleOIDCRouter = express.Router();

googleOIDCRouter.get("/login", (req, _res, next) => {
    console.log("QUERY", req.query);
    if (req.query.n) {
        (req.session as any).next = req.query.n;
    }
    next();
}, passport.authenticate("google"));

googleOIDCRouter.get("/redirect", passport.authenticate(
    "google",
    {
        successReturnToOrRedirect: "/redirect",
        // We don't have any error page yet
        failureRedirect: "/"
    }
));
