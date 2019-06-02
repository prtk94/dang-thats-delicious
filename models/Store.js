const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

//Schema
const storeSchema = new mongoose.Schema({
    name: {
        type:String,
        trim: true,
        required: 'Please enter a store name!'
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    location: {
        type:{
            type:String,
            default: 'Point'
        },
        coordinates: [{
            type:Number,
            required: 'You must supply coordinates'
        }],
        address: {
            type:String,
            required: 'You must supply an address'
        },         
    },
    photo:String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref:'User',
        required:'You must supply an author'
    }
});

//Define our indexes
//1 - for Search API
storeSchema.index({
    name: 'text',
    description: 'text'
});
//2 - for location stuff
storeSchema.index({ location: "2dsphere" });

//to autogenerate the slug variable in the schema - get the next val from slug package
storeSchema.pre('save', async function (next) {
   if( !this.isModified('name')){
       next(); //skip slug operation - call next()
       return;//stop this function from running
   }
    this.slug = slug(this.name) //get some val from slug function when passed the current name and assign that value to the slug variable
    
    //find other stores that have a slug of wes, wes1 wes2
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`,'i');
    const storesWithSlug = await this.constructor.find({slug: slugRegEx})
    if(storesWithSlug.length){ //if query returns something
        //autoincrement the matching name eg new abc will be abc1 now
        this.slug= `${this.slug}-${storesWithSlug.length +1}`;
    }   
    next();   
});

//self made functions
storeSchema.statics.getTagsList = function () {
    return this.aggregate([
        {$unwind: '$tags'},
        {$group: { _id: '$tags', count: {$sum: 1} } },
        { $sort: {count: -1}}
    ]
    );    
}

module.exports = mongoose.model('Store',storeSchema);