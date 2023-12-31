const express = require('express');
const app = express();
const bodyParser = require('body-parser');
require("./db/connection");
const authRoutes = require('./routes/authRoutes');
const communityRoutes = require('./routes/communityRoutes');
const memberRoutes = require('./routes/memberRoutes');
const roleRoutes = require('./routes/roleRoutes');
const cookieParser = require('cookie-parser');
const authenticate = require('./middleware/authenticate');
const port = 3000;
const router = express.Router();




app.use(bodyParser.json());
// app.use(router);
app.use(cookieParser());



// Password strength function
const isStrongPassword = (password) => {
    // Check for at least 8 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
  };


//routes
app.use("/auth", authRoutes);
app.use("/community",authenticate, communityRoutes);
app.use("/role", authenticate, roleRoutes);
app.use("/member", authenticate, memberRoutes);



  
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });

