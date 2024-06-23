const express = require("express");
const cors = require("cors");
const app = express();
const pool = require("./db");
const jwt = require("jwt-simple")
require('dotenv').config();
const auth = require('./routes/auth')
const JWT_SECRET = process.env.JWT_SECRET;
const middleware = require('./middleware/auth')

//middleware
app.use(cors({
  origin: "https://todo-app-weld-six.vercel.app/" || "http://localhost:5000"
}));
app.use(express.json());


//Auth Routes//
app.use("/api/auth", auth)

//Routes//

//create a todo//
app.post("/todo", async (req, res) => {
  try {
    const {description, title, inputTime, start_date, deadline} = req.body;
    console.log(description);
    console.log(title);
    const todo = await pool.query(
      "INSERT INTO todo (description, title, deadline_time, deadline, start_date) VALUES($1, $2, $3, $4, $5) RETURNING *", [description, title, inputTime, deadline, start_date]
    );
    res.json(todo);
  } catch (error) {
    console.error(error);
  }
});

//get all todo//
app.get("/todo", middleware, async (req,res) => {

  try {
    const allTodo = await pool.query("SELECT * FROM todo")

    res.json(allTodo)
  } catch (error) {
    console.error(error)
  }
})

//get a todo//
app.get("/todo/:id", middleware, async (req,res) => {

  try {
    const {id} = req.params;
    const todo = await pool.query("SELECT * FROM todo WHERE todo_id = $1", [id]);

    res.json(todo);
  } catch (error) {
    console.error(error)
  }
})

//update a todo//
app.put("/todo/:id", async (req,res) => {
    try {
        const {description, title, inputTime, start_date, deadline} = req.body;
        const {id} = req.params;
        const updatedata = await pool.query("UPDATE todo SET description = $1,title = $2,deadline_time = $3,start_date = $4,deadline=$5   WHERE todo_id = $6", [description,title,inputTime,start_date,deadline,id]);
        res.json(updatedata);
    } catch (error) {
        console.error(error);
    }
})


//delete a todo//
app.delete("/todo/:id", async (req,res) => {
    try {
        const {id} = req.params;
        const deleteData = await pool.query("DELETE FROM todo WHERE todo_id = $1", [id]);
        res.json("Todo was deleted");
    } catch (error) {
        console.log(error.message);
    }
})
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log("Server is running on port 5000");
});
