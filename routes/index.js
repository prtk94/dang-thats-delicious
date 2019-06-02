const express = require('express');
const router = express.Router();

//import controllers
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

//error handlers
const { catchErrors }= require('../handlers/errorHandlers');

// Do work here

//routes for the app
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add', authController.isLoggedIn,storeController.addStore);
router.post('/add', 
storeController.upload,
catchErrors(storeController.resize),
catchErrors(storeController.createStore));

router.post('/add/:id', 
storeController.upload,
catchErrors(storeController.resize),
catchErrors(storeController.updateStore));

router.get('/stores/:id/edit', catchErrors(storeController.editStore));

//for individual stores
router.get("/store/:slug", 
catchErrors(storeController.getStoreBySlug));

//tags page
router.get("/tags", catchErrors(storeController.getStoresByTag));
router.get("/tags/:tag", catchErrors(storeController.getStoresByTag));

//user login
router.get("/login", userController.loginForm);
router.post("/login", authController.login);
router.get("/register", userController.registerForm);
router.post("/register", 
// validate the registration data, register the user, log them in
    userController.validateRegister,
    catchErrors(userController.register),
    authController.login);

//logout route
router.get('/logout', authController.logout);
 
//account 
router.get("/account", authController.isLoggedIn, userController.account);
router.post("/account", catchErrors(userController.updateAccount));

//forgot password flow
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token',
    authController.confirmedPasswords,
    catchErrors(authController.update)
);
//map
router.get('/map', storeController.mapPage)


/*
APIs
*/
//search
router.get('/api/search', catchErrors(storeController.searchStores));
//search stores- near ones
router.get("/api/stores/near", catchErrors(storeController.mapStores));


module.exports = router;
