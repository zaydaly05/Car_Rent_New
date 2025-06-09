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


/*const viewUser = async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/Views/login.ejs');
  const user = await User.findById(req.params.id);
  res.render('ViewUser', { arr: user });
};

const viewCar = async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/user/LoginForm');
  const car = await Car.findById(req.params.id);
  res.render('ViewCar', { arr: car });
};
*/


const displayUsers = async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/user/LoginForm');
  const users = await User.find();
  const nonAdminUsers = users.filter(u => u._id.toString() !== req.session.userId);
  res.render("Users", { arr: nonAdminUsers });
};
const displayCars = async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/user/LoginForm');
  const cars = await Car.find();
  const nonAdminUsers = cars.filter(u => u._id.toString() !== req.session.userId);
  res.render("Users", { arr: nonAdminUsers });
};

const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/admin/Users');
};

const deleteCar = async (req, res) => {
  await Car.findByIdAndDelete(req.params.id);
  res.redirect('/admin/ManageCars');
};


const editCarPage = async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/View/LoginForm');
  const car = await Car.findByName(req.params.name);
  res.render('EditCar', { arr: car });
};

const editUserPage = async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/user/LoginForm');
  const user = await User.findByName(req.params.name);
  if (user.type === 'Admin') {
    res.render('ViewUser', { arr: user, message: "Can't edit admin" });
  } else {
    res.render('EditUser', { arr: user });
  }
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

const getManageCars = async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/user/LoginForm');
  const perPage = 4;
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
    res.json({ redirectUrl: "/admin/Users" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Update failed.' });
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
    res.redirect("/admin/ManageCars");
  } catch (err) {
    console.log(err);
    res.status(500).send('Car update failed.');
  }
};

const getUserOrders = async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/user/LoginForm');
  const user = await User.findById(req.params.id);
  const orders = await Order.find({ user: user._id }).populate('user');
  res.render('UserOrders', { orders, user });
};

const getAllOrders = async (req, res) => {
  if (!isAdmin(req)) return res.redirect('/user/LoginForm');
  const orders = await Order.find().populate('user');
  res.render('Orders', { orders });
};



const deleteOrder = async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.redirect('/admin/Orders');
};

const deleteUserOrder = async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.redirect(`/admin/UserOrders/${req.query.userId}`);
};

module.exports = {
  getAdminPage,
  getAddCar,
  postAddCar,
  getAddUser,
  postaddUser,
  getAllUsers,
  searchCars,
  getManageCars,
  viewUser,
  viewCar,
  editCarPage,
  editUserPage,
  updateUser,
  updateCar,
  getUserOrders,
  getAllOrders,
  deleteUser,
  deleteCar,
  deleteOrder,
  deleteUserOrder
};
