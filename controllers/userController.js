import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { generateToken } from "../config/generateToken.js";

export const userRegister = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      location,
      occupation,
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .send({ message: "User already exists with this email" });
    }

    const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(10));

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      friends: [],
      location,
      occupation,
    });

    if (!newUser) {
      return res.status(500).send({ message: "Failed to register. Try again" });
    }

    res.status(201).send({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).send({ message: `${error.message}` });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) return res.status(400).send({ message: "Invalid credentials" });

    const isPwMatch = await bcrypt.compare(password, user.password);
    if (!isPwMatch)
      return res.status(400).send({ message: "Invalid credentials" });

    const token = generateToken({ _id: user._id }, "2h");
    user = user.toObject(); // convert Mongoose Object to ordinary object for delete operator to work
    delete user.password;
    delete user.tokens;

    let oldTokens = user.tokens || [];

    if (oldTokens.length) {
      oldTokens = oldTokens.filter((token) => {
        const timeDiff = (Date.now() - parseInt(token.signedAt)) / 1000;
        if (timeDiff < 1000 * 60 * 60 * 2) return token;
      });
    }

    const setToken = await User.findByIdAndUpdate(
      { _id: user._id },
      {
        tokens: [
          ...oldTokens,
          { token: token, signedAt: Date.now().toString() },
        ],
      },
      { new: true, rawResult: true }
    );

    if (setToken.lastErrorObject.n <= 0) {
      res.status(500).send({ message: "Internal issue" });
    }

    res.status(200).send({ token, user });
  } catch (error) {
    res.status(500).send({ message: `${error.message}` });
  }
};

export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "No user found" });
    }

    user = user.toObject();
    delete user.password;

    res.status(200).send(user);
  } catch (error) {
    res.status(404).send({ message: `${error.message}` });
  }
};

export const getUserFriendList = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "No user found" });
    }

    let friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );

    friends = friends.map(
      ({
        _id,
        firstName,
        lastName,
        email,
        picturePath,
        friends,
        location,
        occupation,
      }) => {
        return {
          _id,
          firstName,
          lastName,
          email,
          picturePath,
          friends,
          location,
          occupation,
        };
      }
    );

    res.status(200).send(friends);
  } catch (error) {
    res.status(404).send({ message: `${error.message}` });
  }
};

export const addRemoveFriend = async (req, res) => {
  try {
    const { userId, friendId } = req.params;
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user) {
      return res.status(404).send({ message: "No user found" });
    }

    if (!friend) {
      return res.status(404).send({ message: "No account found" });
    }

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((id) => id !== userId);
    } else {
      user.friends.push(friendId);
      friend.friends.push(userId);
    }

    await user.save();
    await friend.save();

    let friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );

    friends = friends.map(
      ({
        _id,
        firstName,
        lastName,
        email,
        picturePath,
        friends,
        location,
        occupation,
      }) => {
        return {
          _id,
          firstName,
          lastName,
          email,
          picturePath,
          friends,
          location,
          occupation,
        };
      }
    );

    res.status(200).send(friends);
  } catch (error) {
    res.status(404).send({ message: `${error.message}` });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { firstName: { $regex: req.query.search, $options: "i" } },
            { lastName: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.status(200).send(users);
  } catch (error) {
    res.status(404).send({ message: `${error.message}` });
  }
};

export const userLogout = async (req, res) => {
  try {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")
    ) {
      return res.status(403).send({ message: "Access denied" });
    }

    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(403).send({ message: "Access denied" });
    }

    const loggedUser = await User.findOne({ _id: req.user._id });

    if (!loggedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    const newTokens = loggedUser.tokens.filter((t) => t.token !== token);

    const updateLogout = await User.findByIdAndUpdate(
      { _id: req.user._id },
      { tokens: newTokens },
      { new: true, rawResult: true }
    );

    if (updateLogout.lastErrorObject.n <= 0) {
      return res
        .status(500)
        .send({ message: "Internal issue" });
    }

    res
      .status(200)
      .send({ message: "Logged out successfully" });
  } catch (error) {
    res.status(404).send({ message: `${error.message}` });
  }
};
