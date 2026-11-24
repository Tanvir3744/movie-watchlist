import {prisma} from '../config/db.js';
import crypto from 'node:crypto';
import {promisify} from "node:util";

const scrypt = promisify(crypto.scrypt);

const registerUser = async (req, res) => {
        const {username, email, password} = req.body;

        // validate the request body;
        if(!username || !email || !password){
             return res.status(400).json({message: "please provide username, email and password"});
        }

        // check if the user already exists;
        const userExists = await prisma.user.findUnique({
                where: {
                    email: email, 
                }
        });

        if(userExists){
                return res.status(400).json({error: "user with this email already exists"});
        };

        
        // has password using cypto node module;
        const salt = crypto.randomBytes(16).toString("hex");
        const derivedkey = await scrypt(password, salt, 64);
        const passwordHash = `${salt}:${derivedkey.toString("hex")}`;
       

        // create a new user;
        const  newUser = await prisma.user.create({
                data: {
                       name: username, 
                       email: email,
                       password: passwordHash
                }
        });


        res.status(201).json({
                status: "success",
                data: {
                        user: {
                            id: newUser.id,
                            username: newUser.name, 
                            email: newUser.email
                        }
                }
        })


};

export {registerUser};