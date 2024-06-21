module.exports = function(req, res, next) {
    const { email,name, password } = req.body;
  
    function validEmail(userEmail) {
      return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
    }
  
    if (req.path === "/register") {

        if(![email,name,password].every(Boolean)){
        console.log("Missing credentials for registration");
        return res.status(401).json("Missing Credentials");
      } else if (!validEmail(email)) {
        console.log("Invalid email format for registration");
        return res.status(401).json("Invalid Email");
      }
    } 
  
    next();
  };
  