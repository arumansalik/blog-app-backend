import User from '../models/User.js';
import Post from '../models/Post.js';

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

}