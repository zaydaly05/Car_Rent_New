const User = require("./models/dataUsersSchema");
const Car = require("./models/carsSchema");
const Order = require('./models/rentOrders');
const multer = require('multer'); // File upload middleware
const upload = multer({ storage: multer.memoryStorage() }); // Configure multer to store files in memory

const isAdmin = (req) => req.session?.userId && req.session?.type === 'Admin';

const getAdminPage = (req, res) => {
  if (isAdmin(req)) return res.render("Admin Dashboard.html");
  res.redirect('/user/LoginForm');
};

const getAddCar = (req, res) => {
  if (isAdmin(req)) return res.render("AddCar");
  res.redirect('/Views/login.ejs');
};

const postAddCar = async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  try {
    const exists = await Car.findOne({ Name: req.body.Name });
    if (exists) return res.status(400).json({ message: 'Car already exists.' });

    const newCar = new Car({
      Name: req.body.Name,
      Price: req.body.Price,
      Category: req.body.Category,
      image: { data: req.file.buffer, contentType: req.file.mimetype },
    });

    await newCar.save();
    res.json({ message: 'Car added successfully.' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error saving car.' });
  }
};

const getAddUser = (req, res) => {
  if (isAdmin(req)) return res.render("AddUser");
  res.redirect('/Views/login.ejs');
};

const postaddUser = async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  try {
    const exists = await Car.findOne({ Name: req.body.Name });
    if (exists) return res.status(400).json({ message: 'User already exists.' });

    const newUser = new User({
      Name: req.body.Name,
      Email: req.body.Mail,
      Role: req.body.role,
      image: { data: req.file.buffer, contentType: req.file.mimetype },
    });

    await newUser.save();
    res.json({ message: 'User added successfully.' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error saving user.' });
  }
};


const displayUsers = async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/Views/login.ejs');
  const user = await User.findById(req.params.id);
  res.render('ViewUser', { arr: user });
};

const displayCars = async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/user/LoginForm');
  const car = await Car.findById(req.params.id);
  res.render('ViewCar', { arr: car });
};



const filterUsers = async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/user/LoginForm');
  const users = await User.find();
  const nonAdminUsers = users.filter(u => u._id.toString() !== req.session.userId);
  res.render("Users", { arr: nonAdminUsers });
};
/*const filterCars = async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/user/LoginForm');
  const cars = await Car.find();
  const nonSportCars = cars.filter(u => u._id.toString() !== req.session.userId);
  res.render("Users", { arr: nonSportCars });
};*/

const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/admin/Users');
};

const deleteCar = async (req, res) => {
  await Car.findByIdAndDelete(req.params.id);
  res.redirect('/admin/ManageCars');
};


const editCarPage = async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/Views/login.ejs');
  const car = await Car.findByName(req.params.name);
  res.render('Edit-car.ejs', { arr: car });
};



const searchCars = async (req, res) => {
  try {
    const results = await Car.find({
      Name: { $regex: new RegExp(req.query.query, 'i') }
    });
    res.json(results);
  } catch (err) {
    console.log(err);
    res.status(500).send('Search failed');
  }
};

const searchUsers = async (req, res) => {
  try {
    const uresults = await User.find({
      Name: { $regex: new RegExp(req.query.query, 'i') }
    });
    res.json(uresults);
  } catch (err) {
    console.log(err);
    res.status(500).send('Search failed');
  }
};


const editUserPage = async (req, res) => {
  
  if (!isAdmin(req)) return res.redirect('/Views/login.ejs');
  const user = await User.findByName(req.params.name);
  if (user.type === 'Admin') {
    res.render('All_Users.ejs', { arr: user, message: "Can't edit admin...Access Developer Mode" });
  } else {
    res.render('edit-user.html', { arr: user });
  }
};

const updateUser = async (req, res) => {
  try {
    const exists = await User.findOne({ Email: req.body.Email, _id: { $ne: req.params.id } });
    if (exists) return res.status(400).json({ message: 'Email already in use.' });

    const updated = {
      FullName: req.body.FullName,
      Email: req.body.Email,
      Address: req.body.Address,
      Password: req.body.Password
    };

    if (req.file) {
      updated.Photo = { data: req.file.buffer, contentType: req.file.mimetype };
    }

    await User.findByIdAndUpdate(req.params.id, updated);
    res.json({ redirectUrl: "/Views/All_Users.ejs" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Update failed.' });
  }
};

const getManageCars = async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/View/login.ejs');
  const perPage = 8;
  const page = req.query.page || 1;

  try {
    const cars = await Car.find().skip((perPage * page) - perPage).limit(perPage);
    const count = await Car.countDocuments();
    res.render('ManageCars', {
      arr: cars,
      current: page,
      pages: Math.ceil(count / perPage)
    });
    
  } catch (err) {
    console.log(err);
    res.status(500).send('Error loading cars.');
  }
};

const updateCar = async (req, res) => {
  try {
    const updated = {
      Name: req.body.Name,
      Price: req.body.Price,
      Category: req.body.Category,
      image: { data: req.file.buffer, contentType: req.file.mimetype }
    };

    await Car.findByIdAndUpdate(req.params.id, updated);
    res.redirect("/Views/All_Cars.ejs");
  } catch (err) {
    console.log(err);
    res.status(500).send('Car update failed.');
  }
};

const getUserOrders = async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/Views/login.ejs');
  const user = await User.findById(req.params.id);
  const orders = await Order.find({ user: user._id }).populate('user');
  res.render('all_rent', { orders, user });
};

const getAllOrders = async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/Views/login.ejs');
  const orders = await Order.find().populate('user'); //populate:  allows the rendered view to access full user info (like name or email) for each order.
  res.render('all_rent.ejs', { orders });
};



const AdminDeleteUserRent = async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.redirect('/Views/all_rent.ejs');
};

const UserDeleteRent = async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.redirect(`/Views/User_Dashboard.ejs/${req.query.userId}`);
};

module.exports = {
  getAdminPage,
  getAddCar,
  postAddCar,
  getAddUser,
  postaddUser,
  searchCars,
  getManageCars,
  editCarPage,
  editUserPage,
  updateUser,
  updateCar,
  getUserOrders,
  getAllOrders,
  deleteUser,
  deleteCar,
  AdminDeleteUserRent,
  UserDeleteRent,
  filterUsers,
  displayUsers,
  displayCars,
  searchUsers
};
