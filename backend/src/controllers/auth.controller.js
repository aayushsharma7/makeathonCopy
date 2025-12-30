import bcrypt from "bcrypt"
import { User } from "../models/user.model.js";


export const loginController = async (req,res) => {
    try {
        console.log(req.body);
        const {username, email, password} = req.body;
        bcrypt.hash(password, 10, async function(err, hash) {
            try {
                const newUser = new User({
                    username,
                    email,
                    password: hash
                })
                const userInfo = await newUser.save();
                res.status(200).send(userInfo);
                console.log("User saved successfully!")

            } catch (err) {
                console.log(err)
                res.status(401).send("Error occured");
            }
        });
    } catch (error) {
        res.status(400).send(error.message);
    }
}

