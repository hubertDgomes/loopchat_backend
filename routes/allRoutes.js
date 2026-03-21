import express from "express"
import authControllers from "../controllers/authControllers.js"

import multer from "multer";
import imageUpload from "../middleware/cloudinaryMiddleware.js";

const router = express.Router()


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage });

router.post("/profilephotoadd", upload.single("profilePhoto"), authControllers.profilePhoto );
router.post("/signup" , authControllers.signupController)
router.post("/login" , authControllers.signinController)
router.get("/allusers" , authControllers.getAllUser)
router.get("/getuser" , authControllers.logedUserData)
router.get("/getuserbyid/:id" , authControllers.getUserById)
router.post("/upload-chat-photo" , upload.single("imageUrl"), async (req ,res)=>{
  if(!req.file){
    return res.status(400).json({ error: "No image provided" });
  }
  const imgPath = req.file.path;
  const imgUrl = await imageUpload(imgPath);
   res.json({ imageUrl: imgUrl.secure_url }); 
})


export default router