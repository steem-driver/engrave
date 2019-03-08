import { Posts } from "../../../submodules/engrave-shared/models/Posts";
import { PostStatus } from "../../../submodules/engrave-shared/enums/PostStatus";

async function createPostWithQuery(query: any) {
    
    query.status = PostStatus.DRAFT;
    
    return await Posts.create(query);
}

export default createPostWithQuery;