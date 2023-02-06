import _ from "lodash";
import User from "../../models/user.js";
import UserLog from "../../models/userLog.js";
import Dict from "../../models/dict.js";

export default {
  Query: {
    getDict: async (parent, { hash, lang }) => {
      hash = Number(hash);
      const entry = await Dict.findOne({ hash });
      console.log("entry", entry);
      // if(!entry || !entry.dicts[lang]) {
      //     return null
      // }
      // it'll return null if not exist
      return entry?.dicts[lang];
    },
    getMoreDict: async (parent, { hashes, lang }) => {
      // hashes: { fieldName: hash }
      console.log("hashes", hashes);
      const hashesObj = JSON.parse(hashes);
      console.log("hashesObj", hashesObj);

      const resultObj = {};
      // console.log("before for");
      for (const [hashKey, hashValue] of Object.entries(hashesObj)) {
        // console.log("inside for");
        const hash = Number(hashValue);
        // console.log("hash", hash);
        const entry = await Dict.findOne({ hash });
        // console.log("entry", entry);
        // if(!entry || !entry.dicts[lang]) {
        //     return null
        // }
        // it'll return null if not exist
        // console.log(entry.dicts[lang]);
        if (!entry || !entry.dicts[lang]) {
          resultObj[hashKey] = "false";
        } else {
          resultObj[hashKey] = entry?.dicts[lang];
        }
        //return entry?.dicts[lang];
      }
      console.log("resultObj", resultObj);
      return JSON.stringify(resultObj);
    },
  },
  Mutation: {
    // createAdmin: async () => {
    //   if (process.env.NODE_ENV !== "development") {
    //     throw new Error("This method is forbidden!");
    //   }
    //   const user = new User({
    //     username: process.env.INIT_USER_USERNAME,
    //     email: process.env.INIT_USER_EMAIL,
    //     password: await bcrypt.hash(process.env.INIT_USER_PASSWORD, 12),
    //     createdBy: process.env.INIT_ROOTNAME,
    //     updatedBy: "-",
    //     valid: true,
    //   });
    //   // grant all permissions
    //   for (const [actualKey, actualValue] of Object.entries(PERMS)) {
    //     user.permissions.push(actualValue);
    //   }
    //   await user.save();
    //   const userLog = new UserLog({
    //     userId: user.id,
    //     newUsername: user.username,
    //     newEmail: user.email,
    //     newCFT: 0,
    //     createdBy: process.env.INIT_ROOTNAME,
    //     actionType: "initialise-admin-user",
    //   });
    //   await userLog.save();
    //   return user;
    // },
    createDict: async (parent, { hash, lang, text }) => {
      hash = Number(hash);
      console.log("createDict params:", hash, lang, text);
      const entry = await Dict.findOne({ hash });
      console.log("entry", entry);
      if (entry && entry.dicts[lang]) {
        return entry.dicts[lang] + "IT IS BAD!!!!";
      }
      let newEntry = {};
      if (!entry) {
        newEntry = new Dict({
          hash: hash,
          dicts: {
            en: text,
            [lang]: `${lang}_${text}`,
          },
        });
        // newEntry.hash = hash;
        // newEntry.dict = {};
        // newEntry.dict.en = text;
        // newEntry.dict[lang] = `${lang}_${text}`;
        // const insert = new Dict({ hash: newEntry.hash, dicts: newEntry.dicts });
        // console.log("newEntry", newEntry);
        // console.log("insert", insert);
        await newEntry.save();
        return newEntry.dicts[lang];
      } else if (!entry.dicts[lang]) {
        await entry.update(
          {
            dicts: {
              ...entry.dicts,
              [lang]: `${lang}_${text}`,
            },
          },
          { returnDocument: "after", new: true, returnOriginal: false }
        );
        console.log("updatedEntry", entry);
        return `${lang}_${text}`;
      }
    },
    createMoreDict: async (parent, { texts, lang }) => {
      // texts: { fieldName: [hash, text] }
      console.log("texts:", texts);
      const textsObj = JSON.parse(texts);
      const resultObj = {};
      console.log("textsObj:", textsObj);
      for (const [textKey, textValue] of Object.entries(textsObj)) {
        // textKey: productManager, textValue: ["12312", "Product Manager"]
        const hash = Number(textValue[0]);
        const text = textValue[1];
        console.log("createDict params:", hash, lang);
        const entry = await Dict.findOne({ hash });
        console.log("entry", entry);
        if (entry && entry.dicts[lang]) {
          resultObj[textKey] = entry.dicts[lang] + "IT IS BAD!!!!";
        }
        //let newEntry = {};
        if (!entry) {
          let newEntry = new Dict({
            hash: hash,
            dicts: {
              en: text,
              [lang]: `${lang}_${text}`,
            },
          });
          // newEntry.hash = hash;
          // newEntry.dict = {};
          // newEntry.dict.en = text;
          // newEntry.dict[lang] = `${lang}_${text}`;
          // const insert = new Dict({ hash: newEntry.hash, dicts: newEntry.dicts });
          // console.log("newEntry", newEntry);
          // console.log("insert", insert);
          try {
            await newEntry.save();
            //.then((res) => console.log("entry has created:", res));
            resultObj[textKey] = newEntry.dicts[lang];
          } catch (err) {
            console.log(err);
          }
        } else if (!entry.dicts[lang]) {
          await entry.update(
            {
              dicts: {
                ...entry.dicts,
                [lang]: `${lang}_${text}`,
              },
            },
            { returnDocument: "after", new: true, returnOriginal: false }
          );
          console.log("updatedEntry", entry);
          resultObj[textKey] = `${lang}_${text}`;
        }
      }
      return JSON.stringify(resultObj);
    },
  },
};
