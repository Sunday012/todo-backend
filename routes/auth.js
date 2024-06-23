const express = require('express');
const argon2 = require('argon2')
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config()
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/register", async (req,res) => {
    const {username, password, email} = req.body;
    try {
      console.log(username)
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [email])
  
      if(user.rows.length){
        res.status(400).json({message: "User already Exist"});
      }
      const hashedPassword = await argon2.hash(password);
      const newUser = await pool.query("INSERT INTO users (username, password, email) VALUES($1, $2, $3) RETURNING *",[username, hashedPassword,email])
  
      res.status(201).json({msg: "User registered Succesfully", newUser})
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Error registering user'});
    }
  })
  
  //Login route//
  
  router.post("/login", async (req, res) => {
  const {email, password} = req.body;
    try{
  
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [email])
      if(user.rows.length === 0){
        res.status(400).json({msg: "Invalid username or password"})
      }
  
      const validPassword = await argon2.verify(user.rows[0].password, password);
  
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
  
      const payload = {id: user.rows[0].user_id, username: user.rows[0].username}
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
      res.json({token});
    }catch(err){
      console.error(err);
      res.status(500).json({ message: 'Error logging in' });
    }
  })

  router.get("/user", async (req,res) => {
    const {email} = req.params;
    try {
        const users = pool.query("SELECT * FROM users")
        res.status(200).json({users})
    }catch (error) {
        console.log(error)
    }
  })


module.exports = router;