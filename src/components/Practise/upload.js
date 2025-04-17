import multer from 'multer';
import nextConnect from 'next-connect';

const upload = multer({ dest: './public/uploads/' });

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Something went wrong! ${error.message}` });
  },
});

apiRoute.use(upload.single('cv'));

apiRoute.post((req, res) => {
  res.status(200).json({ url: `/uploads/${req.file.filename}` });
});

export default apiRoute;

export const config = { api: { bodyParser: false } };