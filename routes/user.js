var express = require('express');
var router = express.Router();
const userHelper=require('../controller/user')
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });



/**
 * @swagger
 * /userInfoRouter/api/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: email,
 *                 required: true
 *               password:
 *                 type: string,
 *                 required: true
 *               name:
 *                 type: string
 *                 required: true
 *               bio:
 *                 type: string
 *               phone:
 *                 type: string
 *                 required: true
 *               photo:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *                 required: true
 *                 description: Set to true for a public account, false for a private account
 *     responses:
 *       '201':
 *         description: User registered successfully
 *       '400':
 *         description: Invalid request
 *       '500':
 *         description: Internal server error
 */
router.post('/api/register',upload.single('photo'),async function(req,res){
    // const { name, email } = req.body;
    const { name, email, password, bio, phone, isPublic } = req.body;
    const { photo } = req.body;

    // Check if photo is a file upload or a URL
    let photoData;
    if (req.file) {
        // If req.file exists, it means a photo was uploaded
        photoData = req.file;
    } else if (photo) {
        // If req.body.photo exists, it means a photo URL was provided
        photoData = photo;
    }

    await userHelper.createUser(
        {
            name,
            email,
            password,
            bio,
            phone,
            isPublic,
        }, photoData
    ).then(result=>{
        res.status(201).send({ "message": "userCreated" })
    }).catch(error=>{
        res.status(500).send({ "message": error })
    })
})


/**
 * @swagger
 * /userInfoRouter/api/update:
 *   put:
 *     summary: Update user details
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: email
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               phone:
 *                 type: string
 *               photo:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *                 description: Set to true for a public account, false for a private account
 *     responses:
 *       '200':
 *         description: User details updated successfully
 *       '400':
 *         description: Invalid request
 *       '500':
 *         description: Internal server error
 */
router.put('/api/update', upload.single('photo'), async function(req, res) {
    try {
        const { email, password, name, bio, phone, isPublic } = req.body;
        const { photo } = req.body;

        // Check if photo is a file upload or a URL
        let photoData;
        if (req.file) {
            // If req.file exists, it means a photo was uploaded
            photoData = req.file;
        } else if (photo) {
            // If req.body.photo exists, it means a photo URL was provided
            photoData = photo;
        }

        // Call the updateUser function from the controller
        await userHelper.updateUser({
            email,
            password,
            name,
            bio,
            phone,
            isPublic,
        }, photoData);

        res.status(200).json({ message: 'User details updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Login successful, returns JWT token
 *       '401':
 *         description: Unauthorized - Invalid credentials
 *       '500':
 *         description: Internal server error
 */
router.post('/api/login', async function(req, res) {
    try {
        const { email, password } = req.body;

        // Find user by email
        // const user = await User.findOne({ email });

        // Check if user exists
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if password is correct
        // const isPasswordValid = await bcrypt.compare(password, user.password);
        // if (!isPasswordValid) {
        //     return res.status(401).json({ message: 'Invalid credentials' });
        // }

        // If credentials are correct, generate JWT token
        // const token = jwt.sign({ id: user._id }, 'your_secret_key', { expiresIn: '1h' });

        // Send the token in the response
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;