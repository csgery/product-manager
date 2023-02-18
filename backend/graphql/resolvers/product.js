import _ from "lodash";
import Product from "../../models/product.js";
import ProductLog from "../../models/productLog.js";
import { formatDate } from "../../helper/helper.js";
import {
  productNotFound_Error,
  productNotChanged_Error,
  productAlreadyValid_Error,
  productSoftDeleteFirst_Error,
  productAlreadySoftDeleted_Error,
  productExistedShortId_Error,
} from "../../helper/errors/productErrors.js";

export default {
  Query: {
    validProducts: async () => {
      try {
        const products = await Product.find({ valid: true });
        return products.map((product) => {
          return {
            ...product._doc,
            id: product.id,
            createdAt: formatDate(product.createdAt),
            updatedAt: formatDate(product.updatedAt),
          };
        });
      } catch (err) {
        throw err;
      }
    },
    deletedProducts: async () => {
      try {
        const products = await Product.find({ valid: false });
        return products.map((product) => {
          return {
            ...product._doc,
            id: product.id,
            createdAt: formatDate(product.createdAt),
            updatedAt: formatDate(product.updatedAt),
          };
        });
      } catch (err) {
        throw err;
      }
    },
    // products: async () => {
    //   try {
    //     const products = await Product.find();
    //     return products.map((product) => {
    //       return {
    //         ...product._doc,
    //         id: product.id,
    //         createdAt: formatDate(product.createdAt),
    //         updatedAt: formatDate(product.updatedAt),
    //       };
    //     });
    //   } catch (err) {
    //     throw err;
    //   }
    // },
    // only with existed ID AND valid=true
    product: async (parent, { id }, { req }) => {
      try {
        const lang = req.headers.language || "en";
        const product = await Product.findOne({ _id: id /*, valid: true*/ }); // IMPORTANT HERE: _id
        if (!product) {
          throw productNotFound_Error(lang);
        }
        return {
          ...product._doc,
          id: product.id,
          createdAt: formatDate(product.createdAt),
          updatedAt: formatDate(product.updatedAt),
        };
      } catch (err) {
        throw err;
      }
    },
  },

  Mutation: {
    createProduct: async (
      parent,
      { name, shortId, quantity, description, image },
      { user: userCtx, req }
    ) => {
      try {
        const lang = req.headers.language || "en";
        // check if the shortID is existed
        const existedShortId = await Product.findOne({
          shortId,
        });
        if (existedShortId) {
          throw productExistedShortId_Error(lang);
        }
        const product = new Product({
          name,
          shortId,
          quantity,
          description,
          image,
          valid: true,
          createdBy: userCtx.sub,
          updatedBy: "-",
        });

        const productResult = await product.save();
        const productLog = new ProductLog({
          productId: productResult.id,
          newName: productResult.name,
          newShortId: shortId,
          newQuantity: quantity,
          newDescription: description,
          newImage: image,
          newValid: true,
          createdBy: userCtx.sub,
          actionType: "create",
        });

        await productLog.save();
        return productResult;
      } catch (err) {
        throw err;
      }
    },
    updateProduct: async (
      parent,
      { id, name, shortId, quantity, image, description },
      { user: userCtx, req }
    ) => {
      try {
        const lang = req.headers.language || "en";
        console.log("image, description:", image, description);
        let product = await Product.findById(id);
        if (!product) {
          throw productNotFound_Error(lang);
        }
        const fieldsToUpdate = {};
        const fieldsToLog = {};

        // add the modifier user
        fieldsToUpdate.updatedBy = userCtx.sub;

        let changes = false;

        // if there is changes
        if (name && product.name !== name) {
          changes = true;
          // add the changed field to fieldsToUpdate
          fieldsToUpdate.name = name;
          // add the old and new values for logging
          fieldsToLog.oldName = product.name;
          fieldsToLog.newName = name;
        }
        if (shortId && product.shortId !== shortId) {
          const existedShortId = await Product.findOne({
            shortId,
          });
          if (existedShortId) {
            // log this incident
            const productLog = new ProductLog({
              // ...fieldsToLog,
              productId: product.id,
              createdBy: userCtx.sub,
              actionType: "update",
              message: "unsuccessful-shortId-update",
            });
            // create the log entry
            await productLog.save();
            console.log("lang type inside update resolver:", typeof lang);
            throw productExistedShortId_Error(lang);
          }
          changes = true;
          fieldsToUpdate.shortId = shortId;
          fieldsToLog.oldShortId = product.shortId;
          fieldsToLog.newShortId = shortId;
        }
        if (quantity && product.quantity !== quantity) {
          changes = true;
          fieldsToUpdate.quantity = quantity;
          fieldsToLog.oldQuantity = product.quantity;
          fieldsToLog.newQuantity = quantity;
        }
        if (description && product.description !== description) {
          changes = true;
          fieldsToUpdate.description = description;
          fieldsToLog.oldDescription = product.description;
          fieldsToLog.newDescription = description;
        }
        if (product.image !== image) {
          changes = true;
          fieldsToUpdate.image = image;
          fieldsToLog.oldImage = product.image;
          fieldsToLog.newImage = image;
        }

        //TODO: Logging in the finally section????

        // if there is no new values in the log that means someone tries to update the product without changes
        const productLog = new ProductLog({
          ...fieldsToLog,
          productId: product.id,
          createdBy: userCtx.sub,
          actionType: "update",
          // if there is no changes than message
        });
        if (_.isEmpty(fieldsToLog)) {
          productLog.message = "unsuccessful-empty-update";
        }

        // create the log entry
        await productLog.save();

        // if there is changes, update
        if (changes) {
          //console.log(fieldsToUpdate);
          await product.update(fieldsToUpdate);

          return product.id;
        }
        // if there is no changes
        throw productNotChanged_Error(lang);
      } catch (err) {
        throw err;
      }
    },
    deleteProduct: async (parent, { id }, { user: userCtx, req }) => {
      try {
        const lang = req.headers.language || "en";
        const product = await Product.findById(id);
        if (!product) {
          throw productNotFound_Error(lang);
        }
        if (!product.valid) {
          throw productAlreadySoftDeleted_Error(lang);
        }

        // this'll return with a success object, NOT WITH THE PRODUCT ITSELF
        await product.update({ valid: false, createdBy: userCtx.sub });

        const productLog = new ProductLog({
          productId: product.id,
          oldValid: product.valid,
          newValid: !product.valid,
          createdBy: userCtx.sub,
          actionType: "softdelete",
        });

        await productLog.save();
        return product;

        // const result = await Product.findByIdAndUpdate(
        //   id,
        //   { valid: false },
        //   { new: true }
        // );
        // return result;
      } catch (err) {
        throw err;
      }
    },
    restoreDeletedProduct: async (parent, { id }, { user: userCtx, req }) => {
      try {
        const lang = req.headers.language || "en";
        const product = await Product.findById(id);
        if (!product) {
          throw productNotFound_Error(lang);
        }
        if (product.valid) {
          throw productAlreadyValid_Error(lang);
        }
        await product.update({ valid: true, createdBy: userCtx.sub });

        const productLog = new ProductLog({
          productId: product.id,
          oldValid: product.valid,
          newValid: !product.valid,
          createdBy: userCtx.sub,
          actionType: "restore-softdelete",
        });

        await productLog.save();

        return product;
      } catch (err) {
        throw err;
      }
    },
    removeProduct: async (parent, { id }, { user: userCtx, req }) => {
      try {
        const lang = req.headers.language || "en";
        const product = await Product.findById(id);
        if (!product) {
          throw productNotFound_Error(lang);
        }
        if (product.valid) {
          throw productSoftDeleteFirst_Error(lang);
        }
        await product.delete();

        const productLog = new ProductLog({
          productId: product.id,
          oldShortId: product.shortId,
          createdBy: userCtx.sub,
          actionType: "delete",
        });
        await productLog.save();

        return product;
      } catch (err) {
        throw err;
      }
    },
  },
};
