const User=require("./models/dataUsersSchema")
const Device=require("./models/carsSchema")
const Order = require('./models/rentOrders')
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



const getAdminP=(req, res) => {
    if (!req.session.userId) {
      return res.redirect('/user/LoginForm.ejs');
  }
  if(req.session.type==='Admin'){
   res.render("AdminPage")
  }else{
    return res.redirect('/user/LoginForm.ejs');
  }
  }

   const getAddCar=(req, res) => {
    if (!req.session.userId) {
      return res.redirect('/user/LoginForm');
  }
  if(req.session.type==='Admin'){
   res.render("AddCar")
  }else{
    return res.redirect('/user/LoginForm');
  }
  }
  const postAdminPage= async (req, res) => {

    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const existingCar= await Car.findOne({ Name: req.body.Name });
        if (existingCar) {
            return res.status(400).json({ message: 'A Car with this name already exists.' });
        }

        const newCar = new Car({
            Name: req.body.Name,
            Price: req.body.Price,
            Category: req.body.Category,
            
            
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            },
        });

        await newCar.save();
        res.json({ message: 'Car added successfully.' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error saving Car.' });
    }
}

const GetAllUsers = (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/user/LoginForm');
  }

  User.find().then((result) => {
    if (req.session.type === 'Admin') {
      const filteredUsers = result.filter(user => user._id.toString() !== req.session.userId);
      res.render("Users", { arr: filteredUsers });
      res.end();
    } else {
      return res.redirect('/user/LoginForm');
    }
  }).catch((err) => {
    console.log(err);
  });
};

   const search = async (req, res) => {
    const query = req.query.query.toLowerCase();
    try {
        const results = await Car.find({
            Name: { $regex: new RegExp(query, 'i') } // Case-insensitive search
        });

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const getManageCarPage = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/user/LoginForm');
    }

    const perPage = 4;
    const page = req.query.page || 1;

    try {
        const cars = await Car.find({})
            .skip((perPage * page) - perPage)
            .limit(perPage);

        const count = await Car.countDocuments();

        if (req.session.type === 'Admin') {
            res.render('ManageCars', {
                arr: cars,
                current: page,
                pages: Math.ceil(count / perPage)
            });
        } else {
            return res.redirect('/views/LoginForm');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
};



  const getViewUserPage=(req, res) => {
    if (!req.session.userId) {
      return res.redirect('/user/LoginForm');
  }
    User.findById(req.params.id).then((result) => {
      if(req.session.type==='Admin'){
      res.render('ViewUser', {arr: result})
      }else {
        return res.redirect('/user/LoginForm');
      }
     
    }).catch((err) => {
      console.log(err);
    })
   
   }
const viewCarsPage=(req, res) => {
    if (!req.session.userId) {
      return res.redirect('/user/LoginForm');
  }
    Car.findById(req.params.id).then((result) => {
      if(req.session.type==='Admin'){
      res.render('ViewCar', {arr: result})
      }else {
        return res.redirect('/user/LoginForm');
      }
     
    }).catch((err) => {
      console.log(err);
    })
   
   }
   const getEditCarPage= (req, res) => {
    if (!req.session.userId) {
      return res.redirect('/user/LoginForm');
  }
    Car.findById(req.params.id).then((result) => {
      if(req.session.type==='Admin'){
      res.render('EditCar', {arr: result})
      }else {
        return res.redirect('/user/LoginForm');
      }
     
    }).catch((err) => {
      console.log(err);
    })
   
   }
   //-------------------------------------------------
   const getUserOrdersPage = async (req, res) => {
    if (!req.session.userId) {
      return res.redirect('/user/LoginForm');
    }
    try {
      const userId = req.params.id;
      const user=await User.findById(req.params.id)
      const orders = await Order.find({ user: userId }).populate('user');
      if (req.session.type === 'Admin') {
        res.render('UserOrders', { orders,user });
      } else {
        return res.redirect('/user/LoginForm');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching orders.');
    }
  };
  
   const getEditUserPage = (req, res) => {
    if (!req.session.userId) {
      return res.redirect('/user/LoginForm');
    }
    User.findById(req.params.id).then((arr) => {
      if (req.session.type === 'Admin') {
        if (arr.type === 'Admin') {
          res.render('ViewUser', { arr, message: "You cannot edit admin data." });
        } else {
          res.render('EditUser', { arr });
        }
      } else {
        return res.redirect('/user/LoginForm');
      }
    }).catch((err) => {
      console.log(err);
    });
  };
  
  const putEditUser=async (req, res) => {
    try {
        const existingUser = await User.findOne({ Email: req.body.Email, _id: { $ne: req.params.id } });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }
  
        const updatedData = {
            FullName: req.body.FullName,
            Email: req.body.Email,
            Address: req.body.Address,
            Password: req.body.Password,
        };
  
        if (req.file) {
            updatedData.Photo = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            };
        }
  
        await User.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        res.json({ redirectUrl: "/admin/Users" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error updating user profile.' });
    }
  }
  const putEditCars=(req, res) => {
    const updatedData = {
      Name: req.body.Name,
      Price: req.body.Price,
     Category: req.body.Category,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
    };
  
    if (req.file) {
      updatedData.Photo = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }
  
    Device.findByIdAndUpdate(req.params.id, updatedData, { new: true }).then((result) => {
      res.redirect("/admin/ManageDevices");
    }).catch((err) => {
      console.log(err);
      res.status(500).send('Error updating Cars image.');
    });
  }
  const delUsers=(req, res) => {    // Delete user by ID
    User.findByIdAndDelete(req.params.id).then(() => {
      res.redirect('/admin/Users')
     
    }).catch((err) => {
      console.log(err);
    })
   
   }
   const delCar=(req, res) => {
    Car.findByIdAndDelete(req.params.id).then(() => {
      res.redirect('/admin/ManageCars')
     
    }).catch((err) => {
      console.log(err);
    })
   
   }
   const deleteOrders=(req, res) => {
    Order.findByIdAndDelete(req.params.id).then(() => {
      res.redirect('/admin/Orders')
     
    }).catch((err) => {
      console.log(err);
    })
   
   }
   const deleteUserOrder = (req, res) => {
    Order.findByIdAndDelete(req.params.id)
        .then(() => {
            const userId = req.query.userId; // Get `userId` from the query string
            res.redirect(`/admin/UserOrders/${userId}`); // Redirect to the correct user's orders page
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error deleting the order.');
        });
};

  
  
   const getRequestsPage=async (req, res) => {
    if (!req.session.userId) {
      return res.redirect('/user/LoginForm');
  }
    try {
      const orders = await Order.find().populate('user');
      if(req.session.type==='Admin'){
      res.render('Orders', { orders });
      }else {
        return res.redirect('/user/LoginForm');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching orders.');
    }
  }
   module.exports = {  // get for admin put for users
    deleteOrders,
    delCar,
    delUsers,
    putEditCars,
    putEditUser,
    getEditUserPage,
    getEditCarPage,
    viewCarsPage,
    getViewUserPage,
    getManageCarPage,
    GetAllUsers,
    postAdminPage,
    getAddCar,
    getAdminP,
    getUsersPage,
    search,
    getUserOrdersPage,
    deleteUserOrder
  };