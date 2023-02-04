import product from "./product.js";
import user from "./user.js";
import dict from "./dict.js";
import _ from "lodash";

export default _.merge({}, product, user, dict);
