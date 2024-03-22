const Post = require('../models/post');
const router = require('express').Router();
const User = require('../models/user');

//create a post
router.post("/",async(req,res)=>{
    const newPost = new Post(req.body);
    try{
        const savePost = await newPost.save();
        res.status(200).json(savePost);
    }
    catch(err){
        console.log("Error: ",err.message);
    }
})

// get a post
    router.get("/:id",async(req,res)=>{
        try{
            const post = await Post.findById(req.params.id);
            res.status(200).json(post);
        }
        catch(err){
            console.log("Error: ",err.message);
        }
    })

// update a post
    router.put("/:id",async (req,res)=>{
        try{
            const post = await Post.findById(req.params.id);
            if(post.userId === req.body.userId){
                await post.updateOne({$set:req.body});
                res.status(200).json("The post has been updated");
            }else{
                res.status(403).json("You can only update your post");
            }
        }
        catch(err){
            console.log("Error: ",err.message);
        }
    })

// delete a post
    router.delete("/:id",async(req,res)=>{
        const post = await Post.findById(req.params.id);
        if(req.body.userId === post.userId){
            try{
                await post.deleteOne();
                res.status(200).json("The post has been deleted");
            }
            catch(err){
                console.log("Error: ",err.message);
            }
        }else{
            res.status(403).json("You can only delete your post");
        }
    })

// like/dislike a post
    router.put("/:id/like",async(req,res)=>{
        try{
            const post = await Post.findById(req.params.id);
            if(!post.likes.includes(req.body.userId)){
                await post.updateOne({$push:{likes:req.body.userId}});
                res.status(200).json("The post has been liked");
            }
            else{
                await post.updateOne({$pull:{likes:req.body.userId}});
                res.status(200).json("The post has been disliked");
            }
        }
        catch(err){
            console.log("Error: ",err.message);
        }
    })


// get timeline posts
    router.get("/timeline/all/:userId",async(req,res)=>{
        try{
            const currentUser = await User.findById(req.params.userId);
            const userPosts = await Post.find({userId:currentUser._id});
            const friendPosts = await Promise.all(
                currentUser.followings.map((friendId)=>{
                    return Post.find({userId:friendId});
                })
            )
            res.status(200).json(userPosts.concat(...friendPosts));
        }
        catch(err){
            console.log("Error: ",err.message);
        }
    })
// get user's all posts
    router.get("/profile/:username",async(req,res)=>{
        try{
            const user = await User.findOne({username : req.params.username});
            const posts = await Post.find({userId : user._id});
            res.status(200).json(posts);
        }
        catch(err){
            console.log("Error: ",err.message);
        }
    })


module.exports = router;