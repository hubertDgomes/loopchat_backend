import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({ 
        cloud_name: 'dwvtzpyqr', 
        api_key: '685878976272563', 
        api_secret: 'UttmWm5pEGHk-eoPyMV_hqEybhU'
    });


const imageUpload = async (filename)=> {
    const result = await cloudinary.uploader.upload(filename)
    fs.unlinkSync(filename)
    return result;
}

export default imageUpload