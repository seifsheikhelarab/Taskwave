//Configuration for Multer to handle file uploads

import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), "public/avatars"));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname) || '.jpg';
        const userId = req.session?.userId || "user";
        cb(null, `${userId}-avatar${ext}`);
    }
});
export const upload = multer({ storage });
