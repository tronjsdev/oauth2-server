import express from 'express';

const homeRouter = express.Router();

/* GET home page. */
homeRouter.get('/', (req, res, next) => {
  let counter = req.session?.counter || 0;
  counter += 1;
  if (req.session) {
    req.session.counter = counter;
  }
  res.render('index', { title: 'Express', env: process.env.NODE_ENV, counter });
});

export { homeRouter };
