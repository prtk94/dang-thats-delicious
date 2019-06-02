const mongoose = require('mongoose');
const Store = mongoose.model('Store'); //we can reference it from mongoose since we export it from Store.js
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');


const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req,file,next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if (isPhoto){
            next(null, true);//next callback doesnt happen
        }
        else{
            next({message: 'That file type is NOT allowed!'}, false) //callback error
        }
    }
}

exports.homePage = (req,res) => {
    res.render('index',{
        title:'Index page'
    });
};

exports.addStore = (req,res) => {
    res.render('editStore',{
        title:'Add store'
    });
};

exports.upload = multer(multerOptions).single('photo');

//resize logic-written as middleware function which can be reused
exports.resize = async(req, res, next) => {
    //check if there is no new file to resize
    if(!req.file) {
        return next(); //skip to next middleware
    }
    const extension = req.file.mimetype.split('/')[1]; //gets the file extn like png/jpg by splittin on / in 'image/jpg'
    req.body.photo = `${uuid.v4()}.${extension}`;
    //now we resize
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800,jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);
    //once its written to filesystem we move on!
    next();

}


exports.createStore = async (req,res) => {
    req.body.author = req.user._id;
    //make object
    const store = await (new Store(req.body)).save();
    req.flash('success', `Sucessfully created ${store.name}. Care to leave a review?`);
    res.redirect(`/store/${store.slug}`);
     
}

exports.getStores = async (req,res) => {
    //query the DB for list of all stores
    const stores = await Store.find();     
    res.render('stores',{
        title:'Stores',
        stores
    });
}

//confirm owner method
const confirmOwner = (store,user) => {
    if(!store.author.equals(user._id)){
        throw Error('You must own a a store in order to edit it!');
    }
}

exports.editStore = async (req, res) => {
    //1) find the store given the id
    const store = await Store.findOne({ _id: req.params.id });
    //2) confirm they are the owner of the store
    confirmOwner(store,req.user);
    //3) render out the edit form
    res.render('editStore', {
        title: `Edit ${store.name}`,
        store
    })
}

exports.updateStore = async (req, res) => {
    //set location data to be a point so that defaults arent overridden in MongoDB
    req.body.location.type='Point';
    //find and update the store
    const store = await Store.findOneAndUpdate({ _id: req.params.id} , req.body,
        {
            new:true, //return the new store instead of old one
            runValidators: true //run the validtors in the schema defined
        }
        ).exec();
    req.flash('success', `Successfully updated ${store.name}! <a href="/stores/${store.slug}">View store -></a>`)
        //redirect them to the store and tell them that it works
    res.redirect(`/stores/${store.id}/edit`);
}

exports.getStoreBySlug = async (req, res) => {
    const store = await Store.findOne( {slug: req.params.slug})
    .populate('author'); //gives all the data about the store's author
    if(!store) return next(); //if query returns null(ie no store exists) go to next middleware on app.js which are the error handlers
    res.render('store', 
        {
            title: store.name,
            store 
    });
}

//tags
exports.getStoresByTag = async (req, res) => {
    
    const tag = req.params.tag;
    const tagQuery = tag || {$exists: true};//either var tag exists or its a property {$xists} is true which will be used to query the DB and display all the stores

    //now we have 2 queries-each will return a promise- and then we wait for both of them to finish
    const tagsPromise = Store.getTagsList();
    const storePromise = Store.find({tags: tagQuery});
    //we destrcucture them now to get both list of tags and stores
    const [tags, stores] = await Promise.all([tagsPromise,storePromise])
    res.render( 'tag' , {
        title:'Tags',
        tags,
        tag,
        stores
    });

}

//search api requirement
exports.searchStores = async (req, res) => {
    const stores = await Store
    //first find stores that match
    .find({
        $text: {
            $search: req.query.q,
        }
    },{
        score: { $meta: 'textScore'}
    }
    )
    //sort them by frequency/ "importance"
    .sort({
        score: { $meta: 'textScore' }
    })
    //limit to top 5
    .limit(5);
    res.json(stores);
};

//getting list of nearby stores
exports.mapStores = async (req, res) => {
    const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
    const q = {
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates
                },
                $maxDistance: 10000 // 10km
            }
        }
    };

    const stores = await Store.find(q).select('slug name description location photo').limit(10);
    res.json(stores);
};

exports.mapPage = (req, res) => {
    res.render('map', { title: 'Map' });
};