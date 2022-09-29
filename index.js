const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

// Adiciona .env ao projeto
require("dotenv").config();

// Configura body-parser
app.use(bodyParser.urlencoded({ extended: true }));

// Configura porta do servidor
const PORT = process.env.PORT || 3001;

// Conexão com o banco de dados
const database = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_FITOLOG_APP,
});

// Função para verificar se API KEY vem pelo header authorization da requisição
const validateHeader = (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization === process.env.API_KEY) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Executa a inicialização do servidor
app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server started successfully on port ${PORT}`);
  }
});

// Configura CORS
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

// Busca todos os Posts
app.get("/api/getPosts", validateHeader, async (req, res) => {
  const SQLGetPosts = `SELECT * FROM posts`;

  try {
    const [data] = await database.promise().query(SQLGetPosts);

    if (data.length > 0) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: "No posts found" });
    }
  } catch (error) {
    console.log(error);
  }
});

// Insere um novo Post
app.post("/api/insertPost", validateHeader, async (req, res) => {
  const { title, message } = req.body;

  if (!title || !message) {
    res.status(400).json({ message: "Missing title or message" });
  } else {
    const SQLInsertPost = `INSERT INTO posts (title, message) VALUES (?, ?)`;

    try {
      const [data] = await database
        .promise()
        .query(SQLInsertPost, [title, message]);

      if (data.affectedRows === 1) {
        res.status(200).json({ message: "Post successfully inserted" });
      } else {
        res.status(500).json({ message: "Error inserting post" });
      }
    } catch (error) {
      console.log(error);
    }
  }
});

// Atualiza um Post
app.put("/api/updatePost", validateHeader, async (req, res) => {
  const { id, title, message } = req.body;

  if (!id || !title || !message) {
    res.status(400).json({ message: "Missing fields" });
  } else {
    const SQLUpdatePost = `UPDATE posts SET title = ?, message = ? WHERE id = ?`;

    try {
      const [data] = await database

        .promise()
        .query(SQLUpdatePost, [title, message, id]);

      if (data.affectedRows === 1) {
        res.status(200).json({ message: "Post successfully updated" });
      } else {
        res.status(500).json({ message: "Error updating post" });
      }
    } catch (error) {
      console.log(error);
    }
  }
});

// Deleta um Post
app.delete("/api/deletePost", validateHeader, async (req, res) => {
  const { id } = req.body;

  if (!id) {
    res.status(400).json({ message: "Missing id" });
  } else {
    const SQLDeletePost = `DELETE FROM posts WHERE id = ?`;

    try {
      const [data] = await database.promise().query(SQLDeletePost, [id]);

      if (data.affectedRows === 1) {
        res.status(200).json({ message: "Post successfully deleted" });
      } else {
        res.status(500).json({ message: "Error deleting post" });
      }
    } catch (error) {
      console.log(error);
    }
  }
});

app.use(express.json());
