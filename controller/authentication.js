const jwt = require('jsonwebtoken');
const userHelper = require('../../controllers/user/basic_info');
var permission_json = require('../../fixtures/permission.json');
var UrlPattern = require('url-pattern');

async function GenerateJwtToken(userobj, loginType) {
    var payload = {
        'userId': userobj['id'],
        'emailId': userobj['email'],
        'loginType': loginType
    }
    return await new Promise((resolve, reject) => {
        let token = jwt.sign(
            payload,
            process.env.TOKEN_SECRETE_KEY,
            { expiresIn: process.env.TOKEN_EXPIRE_HOURS }
        );
        var expireIn = 0;
        jwt.verify(token, process.env.TOKEN_SECRETE_KEY, async function (err, decoded) {
            if (err) {
                console.log("[routes-utils-jwt_token-generateJwtToken]", err);
                return { err };
            }
            expireIn = decoded.exp * 1000;
        })
        let refreshToken = jwt.sign(
            payload,
            process.env.TOKEN_SECRETE_KEY,// jwt token refresh
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_HOURS }// jwt token refresh
        );
        resolve({ token: token, refreshToken: refreshToken, expireIn });
    });
}

async function VerifyJwtToken(req, res, next) {
    /** Verify Jwt Token */
    const bearerHeader = req.headers['authorization'];
    //check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        //split the space at the bearer
        const bearer = bearerHeader.split(' ');
        //Get token from string
        const bearerToken = bearer[1];

        //set the token
        req.token = bearerToken;
        jwt.verify(req.token, process.env.TOKEN_SECRETE_KEY, async function (err, decoded) {
            if (err) {
                err['message'] = ' The Link Has Beeen Expired'
                res.status(401).json(err);
            } else {
                //next middleweare
                res.locals.userId = decoded.userId;
                res.locals.emailId = decoded.emailId;
                res.locals.loginType = decoded.loginType;
                var url = req.originalUrl.split("/?").shift();
                url = url.split("?").shift();
                const method = req.method;
                const userId = decoded.userId;
                var result = await userHelper.get_user_role(
                    userId
                ).catch(error => {
                    return error;
                })
                const role = result.rows[0]['code'];
                res.locals.role = role;
                var result = await ProtectApiRbac(
                    role, url, method
                ).then(response => {
                    return response;
                }).catch(error => {
                    return res.status(500).send({ "error": error });
                });
                if (result) {
                    next();
                } else {
                    return res.status(401).send({ "error": "unauthorized" });
                }
            }
        });
    } else {
        //Fobidden
        res.status(403).send({ 'error': 'Required token' });
    }
}

/**
 * Protect api wrt role, scope
*/
async function ProtectApiRbac(role, url, method) {
    try {
        // get scopes of user role permission
        let scopes = permission_json.filter(x => x.roles.includes(role));
        // terneary operator define to add default empty arry bcs if not included json then not allow api
        scopes = scopes === null ? [] : scopes;
        if (!scopes.length || !scopes) {
            return false;
        }
        // get scope of urls if * contains then has all access else check particular url
        scopeurl = scopes[0]['method'][method.toLowerCase()];

        if (!scopeurl) {
            return false;
        } else if (scopeurl === '*') {
            return true;
        } else {
            var isMatched = false;
            scopeurl.forEach(element => {
                var pattern = new UrlPattern(element);
                if (pattern.match(url)) {
                    isMatched = true;
                    return true
                }
            });
            return isMatched;
        }
    } catch (err) {
        return false
    }
}

async function GenerateTempJwtToken(emailId, userId) {
    var payload = {
        'emailId': emailId,
        'userId': userId
    }
    return await new Promise((resolve, reject) => {
        var token = jwt.sign(
            payload,
            process.env.TEMP_JWT_SECRET_KEY,
            { expiresIn: process.env.JWT_EXPIRE_HOURS_FORGOT_PASSWORD }
        );
        resolve(token)
    });
}

async function VerifyTempJwtToken(req, res, next) {
    /** Verify Jwt Token */
    const bearerHeader = req.headers['authorization'];
    //check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        //split the space at the bearer
        const bearer = bearerHeader.split(' ');
        //Get token from string
        const bearerToken = bearer[1];
        //set the token
        req.token = bearerToken;
        jwt.verify(req.token, process.env.TEMP_JWT_SECRET_KEY, function (err, decoded) {
            if (err) {
                res.status(401).send({ "message": "The link has been expired" });
            } else {
                //next middleweare
                res.locals.userId = decoded.userId;
                res.locals.emailId = decoded.emailId;
                next();
            }
        });
    } else {
        //Fobidden
        res.status(403).send({ 'error': 'Required token' });
    }
}

/** Decode jwt token */
const decodeJwtToken = async (token) => {
    return await new Promise(async (resolve, reject) => {
        jwt.verify(token, process.env.TOKEN_SECRETE_KEY, async function (err, decoded) {
            if (err) {
                reject(err);
            } else {
                //next middleware
                resolve(decoded);
            }
        });
    });
}

/**
 * get access token using refresh token
 */
async function GetAccessTokenUsingRefreshToken(refreshToken, tokenExpire, refreshTokenExpire) {
    return await new Promise(async (resolve, reject) => {
        await decodeJwtToken(refreshToken).then((decoded) => {
            if (decoded) {
                delete decoded.exp;
                delete decoded.iat;
                //need to change the xpire time in env 
                let token = jwt.sign(decoded, process.env.TOKEN_SECRETE_KEY, {
                    expiresIn: process.env.REFRESH_TOKEN_EXPIRE_HOURS,
                })
                let expireIn = 0;
                jwt.verify(token, process.env.TOKEN_SECRETE_KEY, async function (err, decodes) {
                    if (err) {
                        console.log("decodes-------->",decodes)
                        console.log("[routes-utils-jwt_token-generateJwtToken]", err);
                        return { err };
                    }
                    expireIn = decodes.exp * 1000;
                });
                let refreshToken1 = jwt.sign(decoded, process.env.TOKEN_SECRETE_KEY, {
                    expiresIn: process.env.REFRESH_TOKEN_EXPIRE_HOURS
                });
                resolve({ token: token, refreshToken: refreshToken1, expireIn });
            } else {
                reject("Invalid refresh token");
            }
        }).catch((error) => {
            console.log(error)
            reject("Invalid refresh token", error);
        });
    });
}


module.exports = {
    GenerateJwtToken,
    VerifyJwtToken,
    GenerateTempJwtToken,
    VerifyTempJwtToken,
    GetAccessTokenUsingRefreshToken
}