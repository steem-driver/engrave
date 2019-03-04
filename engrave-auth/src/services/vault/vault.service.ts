import getAccessToken from './actions/getAccessToken';
import storeAccessToken from './actions/storeAccessToken';
import storeRefreshToken from './actions/storeRefreshToken';


const vault = {
    getAccessToken,
    storeAccessToken,
    storeRefreshToken
}

export default vault;