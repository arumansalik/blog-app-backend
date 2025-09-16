import User from '../models/User.js';
import Post from '../models/Post.js';
import error from "jsonwebtoken/lib/JsonWebTokenError.js";

// Get Public Profile
export const getUserProfile = async (req, res) => {
    try {
        const {username} = req.params;
        const user = await User.findOne({username})
            .select('user')
            .populate("followers", "username avatar")
            .populate("following", "username avatar");

        if(!user) return res.status(404).json({ message: "User not found"});

        const posts = await Post.find({ author: user._id });

        res.json({ user, posts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { bio, avatar, socialLinks } = req.body;
        if (bio !== undefined) user.bio = bio;
        if (avatar !== undefined) user.avatar = avatar;
        if (socialLinks !== undefined) user.socialLinks = socialLinks;

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const followUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToFollow) return res.status(404).json({ message: "User not found" });

        if(!userToFollow.followers.includes(currentUser._id)) {
            userToFollow.followers.push(currentUser._id);
            currentUser.following.push(userToFollow._id);
            await userToFollow.save();
            await currentUser.save();
        }

        res.json({ message: "Followed Successfully" });
    } catch (err) {
        res.status(500).json({ message: error.message });
    }
};

export const unfollowUser = async (req, res) => {
    try {
        const userToUnfollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if(!userToUnfollow) return res.status(404).json({ message: "User not found" });

        userToUnfollow.followers.pull(currentUser._id);
        currentUser.following.pull(userToUnfollow._id);

        await userToUnfollow.save();
        await currentUser.save();

        res.json({ message: "unfollowed Successfully" });
    } catch (err) {
        res.status(500).json({ message: error.message });
    }
};

export const getFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate("followers", "username avatar");
        if(!user) return res.status(404).json({ message: "User not found"});

        res.json(user.followers);
    } catch (err) {
        res.status(500).json({ message: error.message });
    }
};

export const getFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("following", "username avatar");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user.following);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};