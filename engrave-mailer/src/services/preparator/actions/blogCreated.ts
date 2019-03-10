import * as fs from 'fs';

export default (username: string, domain: string) => {
    const tmp = fs.readFileSync('/app/src/templates/blogs/created.html', 'utf-8');
    const template = tmp.replace('{USERNAME}', `@${username}`).replace('{DOMAIN}', domain);
    return template;
}