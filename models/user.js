const modgoose = require("mongoose");

const userSchema = new modgoose.Schema({
    username:{
        type:String,
        require:true,
        min:3,
        max:20,
        unique:true,
    },
    password:{
        type:String,
        require:true,
        min:6,
    },
    email:{
        type:String,
        require:true,
        max:50,
        unique:true,
    },
    profilePicture:{
        type:String,
        default:"",
    },
    coverPicture:{
        type:String,
        default:"",
    },
    followers:{
        type:Array,
        default:[],
    },
    followings:{
        type:Array,
        default:[],
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    desc:{
        type:String,
        max:50,
    }
},
{timestamps:true}
);

module.exports = modgoose.model("User",userSchema);