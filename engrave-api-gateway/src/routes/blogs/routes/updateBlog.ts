import { Request, Response } from 'express';
import { handleResponseError } from '../../../submodules/engrave-shared';
import { body } from 'express-validator/check';
import { blogExists } from '../../../validators/blog/blogExiststs';
import isDomainValid from '../../../validators/domain/isDomainValid';
import blogsService from '../../../services/blogs/services.blogs';
import { isAddressFree } from '../../../validators/url/isAddressFree';
import { isValidSubdomain } from '../../../validators/url/isValidSubdomain';

const middleware: any[] =  [
    body('id').isString().custom(blogExists).withMessage('Blog does not exist'),
    body('url').isString()
        .isURL().withMessage("Please provide valid subdomain address")
        .custom(isValidSubdomain).withMessage("This is not proper subdomain")
        .custom(isAddressFree).withMessage("This address is taken"),
    body('domain').optional()
        .isString().not().isEmpty()
        .isURL()
        .custom(isAddressFree).withMessage("This address is taken")
        .custom(isDomainValid).withMessage("Domain not pointing to Engrave server"),
    body('domain_redirect').optional().isBoolean(),
    body('title').optional().isString(),
    body('slogan').optional().isString(),
    body('logo_url').optional().isString().isURL(),
    body('main_image').optional().isString().isURL(),

    body('link_facebook').optional().isString().isURL(),
    body('link_twitter').optional().isString().isURL(),
    body('link_linkedin').optional().isString().isURL(),
    body('link_instagram').optional().isString().isURL(),

    body('opengraph_default_image_url').optional().isString().isURL(),
    body('opengraph_default_description').optional().isString(),
    body('onesignal_app_id').optional().isString(),
    body('onesignal_api_key').optional().isString(),
    body('onesignal_body_length').optional().isString(),
    body('onesignal_logo_url').optional().isString().isURL(),
    body('analytics_gtag').optional().isString(),
    body('webmastertools_id').optional().isString(),

    // prohibited
    body('adopter').not().exists().withMessage("Sorry, you are not an early adopter"),
    body('premium').not().exists().withMessage("You tried to become a hacker, don\'t you?"),
    body('_id').not().exists().withMessage('You tried to become a hacker, don\'t you?'),
    body('username').not().exists().withMessage('Cannot change blog owner'),
    body('categories').not().exists().withMessage('To update categories, use another endpoint'),
];

async function handler(req: Request, res: Response) {
    return handleResponseError(async () => {

        const { id } = req.body;
        const { username } = res.locals;

        let blog = await blogsService.getBlogByQuery({_id: id});

        if(blog.owner != username) throw new Error("You are not the owner of that blog!");

        await blogsService.updateBlogWithQuery(id, req.body);

        blog = await blogsService.getBlogByQuery({_id: id});

        return res.json({ status: 'OK', blog });

    }, req, res);
}

export default {
    middleware,
    handler
}