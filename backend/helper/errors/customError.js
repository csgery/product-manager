import { GraphQLError } from "graphql";

export default class customError extends Error {
  constructor(message, code) {
    super(message);
    (this.message = message), (this.code = code);
  }
}

// export default class customError extends GraphQLError {
//   constructor(message, code, obj) {
//     super(message, obj);
//     (this.message = message), (this.code = code);
//   }
// }
