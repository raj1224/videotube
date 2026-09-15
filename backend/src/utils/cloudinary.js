import {v2 as cloudinary} from "cloudinary"
import fs from "fs"







    // Configuration
    cloudinary.config({ 
        cloud_name: 'dpn821efi', 
        api_key: '169869871757654', 
        api_secret: 'hecnRpgfUHsKtyB0kblN4JiF-xM' // Click 'View API Keys' above to copy your API secret
    });
    
    // Upload an image
    //  const uploadResult = await cloudinary.uploader
    //    .upload(
    //        'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
    //            public_id: 'shoes',
    //        }
    //    )
    //    .catch((error) => {
    //        console.log(error);
    //    });
    
    // console.log(uploadResult);
    
    // // Optimize delivery by resizing and applying auto-format and auto-quality
    // const optimizeUrl = cloudinary.url('shoes', {
    //     fetch_format: 'auto',
    //     quality: 'auto'
    // });
    
    // console.log(optimizeUrl);
    
    // // Transform the image: auto-crop to square aspect_ratio
    // const autoCropUrl = cloudinary.url('shoes', {
    //     crop: 'auto',
    //     gravity: 'auto',
    //     width: 500,
    //     height: 500,
    // });
    
    // console.log(autoCropUrl);    
// })();

const uploadOnCloudinary = async (localFilePath) => {
    try {

        if (!localFilePath) return null;
        


        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });


        console.log("File uploaded on Cloudinary:", response.url);

        fs.unlinkSync(localFilePath);
        

        return response;

    } catch (error) {
        console.log("Cloudinary upload error:", error);

        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};


export {uploadOnCloudinary}