import express from 'express';

const router = express.Router();

router.get('/', async (req, res, next) => {
  return res.render('private', {});
});

export {router as privateRouter}
