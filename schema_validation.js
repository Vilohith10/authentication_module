var Validator = require("jsonschema").Validator;
var user_helper= require("./controller/user")

async function validateLoginSchema(req, res, next) {
    // declare validator
    var v = new Validator();
    // req body data
    var response_body = req.body;
    // user basic info schema define
    var loginschema = {
      id: "/LoginSchema",
      type: "object",
      properties: {
        emailId: {
          type: "string",
          required: true,
        },
        password: {
          type: "string",
          required: true,
        },
      },
    };
    // validate schema
    var is_valid = v.validate(response_body, loginschema).valid;
    // validate schema of jsonschema
    if (is_valid) {
      var emailId = req.body.emailId;
      const password = req.body.password;
      var login_info = await user_helper
        .getUserDetails(emailId)
        .catch((error) => {
          return res.status(500).send({ error: error });
        });
      var user_result = login_info.rows[0];
      if (user_result) {
        // Validate password.
        bcrypt.compare(
          password,
          user_result["password_hash"],
          async function (err, results) {
            if (results) {
              next();
            } else {
              return res.status(400).send({ error: "INVALID_CREDENCTIAL" });
            }
          }
        );
      } else {
        return res.status(400).send({ error: "USER_NOT_FOUND" });
      }
    } else {
      var errors = await getErrorMessage(
        v.validate(response_body, loginschema).errors
      );
      return res.status(400).send({ error: errors });
    }
  }



module.exports={
  validateLoginSchema 
}