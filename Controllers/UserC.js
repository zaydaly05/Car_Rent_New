const User=require("../models/mydataSchema")
const Device=require("../models/devicesSchema")
const Order = require('../models/order')
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });




const Login = async (req, res) => {
    try {
        const { Email, Password } = req.body;
        const user = await User.findOne({ Email });
        if (!user || user.Password !== Password) {
            return res.status(400).send('Incorrect email or password.');
        }
        req.session.userId = user._id;
        req.session.type = user.type;
        if (user.type === 'Client') {
            res.json({ redirectUrl: '/user/UserPage' });
        } else {
            res.json({ redirectUrl: '/admin/AdminPage' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Error logging in.');
    }
};

const getLogin = (req, res) => {
    res.render("LoginForm");
};

const getResPage = (req, res) => {
    res.render("RegisterationForm");
};

const userPage = (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/user/LoginForm');
    }

    User.findById(req.session.userId).then(user => {
        if (req.session.type === 'Client') {
            res.render('UserPage', { user });
        } else {
            return res.redirect('/user/LoginForm');
        }
    }).catch(err => {
        console.log(err);
        res.status(500).send('Error fetching user data.');
    });
};

  const postRigster=async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const existingUser = await User.findOne({ Email: req.body.Email });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }

        const user = new User({
            FullName: req.body.FullName,
            Email: req.body.Email,
            Address: req.body.Address,
            Password: req.body.Password,
            ScreenSpace: req.body.ScreenSpace,
            type: req.body.type,
            Photo: {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            },
        });
        
        await user.save();

        req.session.userId = user._id;
        req.session.type = user.type;
        res.json({ redirectUrl: '/user/UserPage' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error saving user.' });
    }
}
const getSummary=(req, res) => {
    if (!req.session.userId) {
      return res.redirect('/user/LoginForm');
      
    }
  
    if(req.session.type==='Client'){
    res.render("summary")
    }else {
      return res.redirect('/user/LoginForm');
    }
   }
   const getEditProfilePage=(req, res) => {
    if (!req.session.userId) {
      return res.redirect('/user/LoginForm');
    }
  

    User.findById(req.session.userId).then(user => {
      res.render('EditProfileUser', { user });
    }).catch(err => {
      console.log(err);
      res.status(500).send('Error fetching user data.');
    });
  }
  const postEditProfilePage = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/user/LoginForm');
    }

    try {
        const existingUser = await User.findOne({ Email: req.body.Email, _id: { $ne: req.session.userId } });
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

        await User.findByIdAndUpdate(req.session.userId, updatedData, { new: true });

        const redirectUrl = req.session.type === "Client" ? '/user/UserPage' : '/admin/AdminPage';

        res.json({ redirectUrl });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error updating user.' });
    }
};

  const search = async (req, res) => {
    const query = req.query.query.toLowerCase();
    try {
        const results = await Device.find({
            Name: { $regex: new RegExp(query, 'i') } 
        });

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const getDevicesPage = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/user/LoginForm');
    }

    const perPage = 4;
    const page = req.query.page || 1;

    try {
        const devices = await Device.find({})
            .skip((perPage * page) - perPage)
            .limit(perPage);

        const count = await Device.countDocuments();

        if (req.session.type === 'Client') {
            res.render('Devices', {
                arr: devices,
                current: page,
                pages: Math.ceil(count / perPage)
            });
        } else {
            return res.redirect('/user/LoginForm');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
};




const getDevicePage=(req, res) => {
    if (!req.session.userId) {
      return res.redirect('/user/LoginForm');
      
    }
    Device.findById(req.params.id).then((result) => {
      if(req.session.type==='Client'){
      res.render('Device', {arr: result})
      }else{
        return res.redirect('/user/LoginForm');
      }
    }).catch((err) => {
      console.log(err);
    })
   
   }
const getUserProfilePage=(req, res) => {
    if (!req.session.userId) {
      return res.redirect('/user/LoginForm');
    }
  
    User.findById(req.session.userId).then(user => {
      res.render('UserProfile', { user });
    }).catch(err => {
      console.log(err);
      res.status(500).send('Error fetching user data.');
    });
  }

  const postEditProfileUser=(req, res) => {
    User.findById(req.params.id).then((result) => {
      res.render('UserPage', {arr: result})
     
    }).catch((err) => {
      console.log(err);
    })
   
   }
   const getDeviceImages=async (req, res) => {
    try {
      const device = await Device.findById(req.params.id);
      if (!device || !device.image) {
        return res.status(404).send('Device image not found');
      }
      res.contentType(device.image.contentType);
      res.send(device.image.data);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
  const getUserImages=async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user || !user.Photo) {
        return res.status(404).send('User image not found');
      }
      res.contentType(user.Photo.contentType);
      res.send(user.Photo.data);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
  
    }
  }
  const getBuyPage=(req, res) => {
 
    if (!req.session.userId) {
      return res.redirect('/user/LoginForm');
    }
  
    
    User.findById(req.session.userId).then(user => {
      if(req.session.type==='Client'){
      res.render('Buy', { user});
      }else{
        return res.redirect('/user/LoginForm');
      }
    }).catch(err => {
      console.log(err);
      res.status(500).send('Error.');
    });
  }
  const postUserPage=async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/user/LoginForm');
    }
    const { orderItems, totalPrice, orderDate } = req.body;
    const userId = req.session.userId;
  
 
    const parsedOrderItems = JSON.parse(orderItems);
  
    const newOrder = new Order({
        orderItems: parsedOrderItems,
        totalPrice: Number(totalPrice), 
        orderDate,
        user: userId
    });
  
    try {
        await newOrder.save();
        res.status(200).json({ message: 'Order saved successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving order.' });
    }
  }
  const getHistory=async (req, res) => {
    if (!req.session.userId) {
      return res.redirect('/user/LoginForm');
  }
    try {
        const userId = req.session.userId;
        const orders = await Order.find({ user: userId }).populate('user');
        if(req.session.type==='Client'){
        res.render('History', { orders });
        }else {
          return res.redirect('/user/LoginForm');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching orders.');
    }
  }
  const getOrderDetailsPage=(req, res) => {
    if (!req.session.userId) {
      return res.redirect('/user/LoginForm');
  }
    Order.findById(req.params.id2).then((order) => {
      res.render('OrderDetails', { order });
    }).catch((err) => {
      console.log(err);
      res.status(500).send('Error retrieving order details.');
    });
  }
  
  const getLogOut= (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.redirect('/');
      }
      res.clearCookie('connect.sid'); // Clear the session ID cookie
      res.redirect('/');
    });
  }
  module.exports = {
    getLogOut,
    getOrderDetailsPage,
    getHistory,
    getBuyPage,
    getUserImages,
    getDeviceImages,
    postEditProfileUser,
    postUserPage,
    Login,
    getLogin,
    getResPage,
    userPage,
    postRigster,
    getSummary,
    getEditProfilePage,
    postEditProfilePage,
    getDevicesPage,
    getDevicePage,
    getUserProfilePage,
    postUserPage,
    search


  };

  

  