
const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Ensures email uniqueness
    },
    passwordHash: {
        type: String,
        required: true
    },
    passwordSalt: {
        type: String,
        required: true
    },
    bio: String,
    phone: {
        type: String,
        required: true
    },
    photo: {
        type: String, // Assuming you store the photo URL in the database
        required: true
    },
    isPublic: {
        type: Boolean,
        required: true
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default:false
    }
});

// Create a User model using the schema
const User = mongoose.model('User', userSchema);

module.exports = {
    User
};