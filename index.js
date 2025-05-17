const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
const livereload = require('livereload');
const connectLive = require('connect-livereload');
const User = require('./models/mydataSchema'); 

const app = express();
const port = process.env.port || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.set('view engine', 'ejs');
app.use(express.static('public'));


const livereloadServer = livereload.createServer();
livereloadServer.watch(path.join(__dirname, 'public'));
app.use(connectLive());


mongoose.connect('mongodb+srv://ahmed2134:iLP24YewekpvkFe6@cluster0.dnjw4bw.mongodb.net/all-data?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    app.listen(port, () => {
      console.log(`http://localhost:${port}/`);
    });
  })
  .catch(err => console.log(err));

const indexRoutes = require("./routes/home");
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

app.use('/',indexRoutes)
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);


app.get('/', (req, res) => {
  res.render('Home');
});


app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.user = user;
      }
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});


app.use((req, res, next) => {
  res.status(404).render('404');
});


app.use(( req, res, next) => {
  res.status(500).render('404');
});