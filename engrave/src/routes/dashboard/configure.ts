import { PostValidators } from './../../validators/PostValidators';
import { Blogs } from './../../database/BlogsModel';
import { IExtendedRequest } from '../IExtendedRequest';
import { NodeAppsModule } from '../../modules/NodeApps';
import { Tier } from '../../database/helpers/TierEnum';
import { GetValidators } from '../../validators/GetValidators';
import * as express from 'express';

let router = express.Router();

router.get('/configure', GetValidators.isLoggedAndConfigured, (req: IExtendedRequest, res: express.Response) => {

    if (!req.session.blogger.configured) {
        res.render('dashboard/configure.pug', { blogger: req.session.blogger, url: 'configure' });
    } else {
        res.redirect('/dashboard');
    }

});

router.post('/configure/finish', PostValidators.isLoggedIn, async (req: IExtendedRequest, res: express.Response) => {

    try {
        let configuration = req.body;
        let domain = configuration.domain;
        if (configuration.subdomain) {
            domain = configuration.subdomain + "." + configuration.domain;
        }
        let blog = await Blogs.findOne({domain: domain});
        if (blog) throw new Error('Blog with that domain already exist. Try another one');
        blog = await Blogs.findOne({ steem_username: req.session.steemconnect.name });
        if(blog.configured) throw new Error('You already configured your blog!');

        if (!blog.configured) {
            blog.configured = true;
            blog.email = configuration.email;
            blog.theme = configuration.theme;
            blog.category = configuration.category;
            blog.domain = domain;

            if (blog.tier == Tier.BASIC) {
                blog.ssl = true;
            } else if (blog.tier == Tier.STANDARD || blog.tier == Tier.EXTENDED) {
                blog.is_domain_custom = true;
            }

            await blog.save();

            await NodeAppsModule.createAndRun(blog);

            res.json({ success: "Configured successfully!" });
        }
    } catch (error) {
        res.json({ error: "Error occured. Try again" });
    }

});



module.exports = router;