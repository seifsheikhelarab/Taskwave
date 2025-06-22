import multer from "multer";
import path from "path";

// Multer config for avatar uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), "public/avatars"));
    },
    filename: function (req, file, cb) {
        // Use userId-avatar.jpg as in OAuth
        const ext = path.extname(file.originalname) || '.jpg';
        const userId = req.session?.userId || "user";
        cb(null, `${userId}-avatar${ext}`);
    }
});
export const upload = multer({ storage });
