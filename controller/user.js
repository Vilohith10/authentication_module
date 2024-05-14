const { rejects } = require("assert");
const mongoose = require("mongoose");
const {User} = require('../controller/db_schema');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');


async function createUser(userInfo, photoData) {
    return new Promise(async (resolve, reject) => {
        bcrypt.genSalt(parseInt(process.env.salt_rounds), async (error, salt) => {
            bcrypt.hash(userInfo.password, salt, async (error, hash) => {
                userInfo['passwordHash'] = hash;
                userInfo['passwordSalt'] = salt;
                const newUser = new User(userInfo);

                console.log("newUser------------>", newUser)

                // Handle photo storage or URL
                if (photoData && photoData.buffer) { // If photo is uploaded as a file
                    const photoFileName = `user_${Date.now()}_${path.extname(photoData.originalname)}`;
                    const photoPath = path.join(__dirname, '..', 'uploads', photoFileName);

                    await fs.promises.writeFile(photoPath, photoData.buffer);

                    // Save the photo file path in the user document
                    newUser.photo = photoPath;
                } else if (photoData && typeof photoData === 'string') { // If photo is a URL
                    newUser.photo = photoData;
                }

                // Save the user to the database
                const savedUser = await newUser.save();
                resolve(savedUser);
            })

        })

    })
}


async function updateUser(userInfo, photoData) {
    try {
        // Find the user by email
        const user = await User.findOne({ email: userInfo.email });

        // Update user details
        if (userInfo.password) {
            user.password = userInfo.password;
        }
        if (userInfo.name) {
            user.name = userInfo.name;
        }
        if (userInfo.bio) {
            user.bio = userInfo.bio;
        }
        if (userInfo.phone) {
            user.phone = userInfo.phone;
        }
        if (userInfo.isPublic !== undefined) {
            user.isPublic = userInfo.isPublic;
        }
        if (photoData) {
            if (photoData.buffer) { // If photo is uploaded as a file
                const photoFileName = `user_${Date.now()}_${path.extname(photoData.originalname)}`;
                const photoPath = path.join(__dirname, '..', 'uploads', photoFileName);

                await fs.promises.writeFile(photoPath, photoData.buffer);

                // Save the photo file path in the user document
                user.photo = photoPath;
            } else if (typeof photoData === 'string') { // If photo is a URL
                user.photo = photoData;
            }
        }

        // Save the updated user to the database
        await user.save();
    } catch (error) {
        throw error;
    }
}



async function getUserDetails(email){
    const user = await User.findOne({ email });
    console.log('user-------------->',user)
}


// const userSchema = new mongoose.Schema({
//     email: { type: String, unique: true },
//     password: String,
//     name: String,
//     bio: String,
//     phone: String,
//     photo: String,
//     ispublic: Boolean
//   });

// const User = mongoose.model('User', userSchema);

// module.exports={
//     userSchema,
//     User
// }


module.exports={
    createUser,
    updateUser,
    getUserDetails
}