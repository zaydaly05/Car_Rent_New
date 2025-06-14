const User = require("../models/mydataSchema");
const Device = require("../models/devicesSchema");
const Order = require("../models/order");
const RentOrder = require("../models/rentOrder"); 
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.set('views', path.join(__dirname, 'Views'));
app.set("view engine", "ejs");

const Login = async (req, res) => {
    try {
        const { Email, Password } = req.body;
        const user = await User.findOne({ Email });
        if (!user || user.Password !== Password) {
            return res.status(400).send("Incorrect email or password.");
        }
        req.session.userId = user._id;
        req.session.type = user.type;
        if (user.type === "User") {
            res.json({ redirectUrl: "/Views/usd" });
        } else {
            res.json({ redirectUrl: "/Views/Admin Dashboard" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Error logging in.");
    }
};

const getLogin = (req, res) => {
    res.render("login.ejs");
};

const getSignUpPage = (req, res) => {
    res.render("signup.ejs");
};

const userPage = (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/Views/login.ejs");
    }

    User.findById(req.session.userId)
        .then((user) => {
            if (req.session.type === "User") {
                res.render("usd.ejs", { user });
            } else {
                return res.redirect("/Views/login.ejs");
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error fetching user data.");
        });
};

const postSignUp = async (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    try {
        const existingUser = await User.findOne({ Email: req.body.Email });
        if (existingUser) {
            return res.status(400).json({ message: "A user with this email already exists." });
        }

    let role = "User"; 

        if (req.body.password === "admin123") {
            role = "admin";
}
        const user = new User({
            FullName: req.body.FullName,
            Email: req.body.Email,
            Password: req.body.Password,
            Role: role,
            Photo: {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            },
        });

        await user.save();

        req.session.userId = user._id;
        req.session.type = user.type;
        if (user.Role === "User") {
            return res.json({ redirectUrl: "/Views/usd" });
        } else {
            return res.json({ redirectUrl: "/Views/Admin Dashboard" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error saving user." });
    }
};

const getRentalSummary = (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/Views/login.ejs");
    }

    if (req.session.type === "User") {
        res.render("AllRentals.ejs");
    } else {
        return res.redirect("/Views/login.ejs");
    }
};

const getEditProfilePage = (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/Views/login.ejs");
    }

    User.findById(req.session.userId)
        .then((user) => {
            res.render("edit-user.html", { user });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error fetching user data.");
        });
};

const postEditProfilePage = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/Views/login.ejs");
    }

    try {
        const existingUser = await User.findOne({ Email: req.body.Email, _id: { $ne: req.session.userId } });
        if (existingUser) {
            return res.status(400).json({ message: "A user with this email already exists." });
        }

        const updatedData = {
            FullName: req.body.FullName,
            Email: req.body.Email,
            Address: req.body.Address,
            Password: req.body.Password,
            Phone: req.body.Phone,
        };

        if (req.file) {
            updatedData.Photo = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            };
        }

        await User.findByIdAndUpdate(req.session.userId, updatedData, { new: true });

        const redirectUrl = req.session.type === "User" ? "/Views/usd" : "/Views/Admin Dashboard";

        res.json({ redirectUrl });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error updating user." });
    }
};

const CarSearch = async (req, res) => {
    const query = req.query.query.toLowerCase();
    try {

        const cars = await carsSchema.find({ carName: { $regex: new RegExp(query, 'i') } });
        res.json({ cars });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

const getCarsEPage = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/Views/login.ejs");
    }

    const perPage = 4;
    const page = req.query.page || 1; 

    try {
        const cars = await carsSchema.find({})
            .skip(perPage * page - perPage)
            .limit(perPage);

        const count = await carsSchema.countDocuments();

        if (req.session.type === "User") {
            res.render("Cars", {
                arr: cars,
                current: page,
                pages: Math.ceil(count / perPage),
            });
        } else {
            return res.redirect("/Views/login.ejs");
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};

const getCarsLPage = (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/Views/login.ejs");
    }
    carsSchema.findById(req.params.id)
        .then((result) => {
            if (req.session.type === "User") {
                res.render("Device", { arr: result });
            } else {
                return res.redirect("/Views/login.ejs");
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error retrieving Car.");
        });
};

const getUserProfilePage = (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/user/LoginForm");
    }

    User.findById(req.session.userId)
        .then((user) => {
            res.render("UserProfile", { user });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error fetching user data.");
        });
};

const postEditProfileUser = (req, res) => {
    User.findById(req.params.id)
        .then((result) => {
            res.render("UserPage", { arr: result });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error retrieving user data.");
        });
};

const getDeviceImages = async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);
        if (!device || !device.image) {
            return res.status(404).send("Device image not found");
        }
        res.contentType(device.image.contentType);
        res.send(device.image.data);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

const getUserImages = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.Photo) {
            return res.status(404).send("User image not found");
        }
        res.contentType(user.Photo.contentType);
        res.send(user.Photo.data);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

const getBuyPage = (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/user/LoginForm");
    }

    User.findById(req.session.userId)
        .then((user) => {
            if (req.session.type === "Client") {
                res.render("Buy", { user });
            } else {
                return res.redirect("/user/LoginForm");
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error.");
        });
};

const postUserPage = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/user/LoginForm");
    }
    const { orderItems, totalPrice, orderDate } = req.body;
    const userId = req.session.userId;

    const parsedOrderItems = JSON.parse(orderItems);

    const newOrder = new Order({
        orderItems: parsedOrderItems,
        totalPrice: Number(totalPrice),
        orderDate,
        user: userId,
    });

    try {
        await newOrder.save();
        res.status(200).json({ message: "Order saved successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error saving order." });
    }
};

const getRentPage = (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/user/LoginForm");
    }

    User.findById(req.session.userId)
        .then((user) => {
            if (req.session.type === "Client") {
                res.render("Rent", { user });
            } else {
                return res.redirect("/user/LoginForm");
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error.");
        });
};

const postRentOrder = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/user/LoginForm");
    }
    const { rentalRequests, totalPrice, rentalDate } = req.body;
    const userId = req.session.userId;

    const parsedRentalRequests = JSON.parse(rentalRequests);

    const newRentOrder = new RentOrder({
        rentalRequests: parsedRentalRequests,
        totalPrice: Number(totalPrice),
        rentalDate,
        userId,
    });

    try {
        await newRentOrder.save();
        res.status(200).json({ message: "Rental order saved successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error saving rental order." });
    }
};

const getHistory = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/user/LoginForm");
    }
    try {
        const userId = req.session.userId;
        const purchaseOrders = await Order.find({ user: userId }).populate("user");
        const rentOrders = await RentOrder.find({ userId }).populate("userId");
        if (req.session.type === "Client") {
            res.render("History", { purchaseOrders, rentOrders });
        } else {
            return res.redirect("/user/LoginForm");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching orders.");
    }
};


const getAllRentals = (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/Views/login.ejs");
    }
    RentOrder.findById(req.params.id)
        .then((rentOrder) => {
            if (req.session.type === "Client") {
                res.render("RentOrderDetails", { rentOrder });
            } else {
                return res.redirect("/user/LoginForm");
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error retrieving rental order details.");
        });
};

const getLogOut = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect("/");
        }
        res.clearCookie("connect.sid");
        res.redirect("/");
    });
};

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
    CarSearch,
    getEditProfilePage,
    postEditProfilePage,
    getDevicesPage,
    getDevicePage,
    getUserProfilePage,
    postRentOrder,
    getRentPage,
    getRentOrderDetailsPage,
    search,
    postSignUp,
    getRentalSummary,
    getSignUpPage
};
