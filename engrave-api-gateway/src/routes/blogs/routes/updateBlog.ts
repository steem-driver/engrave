import { Request, Response } from 'express';
import { handleResponseError } from '../../../submodules/engrave-shared';
import { body } from 'express-validator/check';
import { blogExists } from '../../../validators/blog/blogExiststs';
import isDomainValid from '../../../validators/domain/isDomainValid';
import blogsService from '../../../services/blogs/services.blogs';
import { validateAddressIsFree } from '../../../validators/url/validateAddressIsFree';
import { isValidSubdomain } from '../../../validators/url/isValidSubdomain';
import { setBlog } from '../../../submodules/engrave-shared/services/cache/cache';
import rebuildSitemap from '../../../services/sitemap/actions/rebuildSitemap';
import validateBlogOwnership from '../../../services/blogs/actions/validateBlogOwnership';

const middleware: any[] = [
    body('id').isString().custom(blogExists).withMessage('Blog does not exist'),
    body('domain').optional()
        .isString().not().isEmpty()
        .isURL().withMessage("Please provide valid subdomain address")
        .custom(isValidSubdomain).withMessage("This is not a proper subdomain"),
    body('custom_domain').optional()
        .isString().not().isEmpty()
        .isURL()
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
    body('collaboration_type').not().exists().withMessage("You tried to become a hacker, don\'t you?"), // TODO 
    body('premium').not().exists().withMessage("You tried to become a hacker, don\'t you?"),
    body('owner').not().exists().withMessage("You tried to become a hacker, don\'t you?"),
    body('_id').not().exists().withMessage('You tried to become a hacker, don\'t you?'),
    body('categories').not().exists().withMessage('To update categories, use another endpoint'),
];

async function handler(req: Request, res: Response) {
    return handleResponseError(async () => {

        const { id, domain, custom_domain } = req.body;
        const { username } = res.locals;
        
        await validateBlogOwnership(id, username);

        if (domain) {
            await validateAddressIsFree(domain, id);
        }

        if (custom_domain) {
            await validateAddressIsFree(custom_domain, id);
        }
        
        const blog = await blogsService.updateBlogWithQuery(id, req.body);

        await setBlog(blog);
        await rebuildSitemap(blog);

        return res.json({ status: 'OK', blog });

    }, req, res);
}

export default {
    middleware,
    handler
}