//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

// DB setup
mongoose.connect("mongodb://localhost:27017/wikiDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const articleSchema = {
  title: {
    type: String,
    required: [true, "No title added."]
  },
  content: {
    type: String,
    required: [true, "No content added."]
  }
};

const Article = new mongoose.model("Article", articleSchema);

// API
// get all written articles
app.get("/articles", function(req, res){
  Article.find(function(err, foundArticles){
    if (!err) {
      if (foundArticles.length === 0) {
        res.send("No articles found.")
      } else {
        res.send(foundArticles);
      }

    } else {
      res.send(err);
    }
  });
});

// write a new article
app.post("/articles", function(req, res) {

  // Check if there is an article with the same title.
  Article.findOne({title: req.query.title}, function(err, foundArticle) {
    if (!err) {

      // If there is no article with this tilte, insert the new article.
      if (!foundArticle) {
        const newArticle = new Article({
          title: req.query.title,
          content: req.query.content
        });

        newArticle.save(function(err) {
          if (!err) {
            res.send("You just successfully added a new article.");
          } else {
            res.send(err);
          }
        });
      } else {
        res.send("The article already exists.");
      }
    // Throw an error if it's not possible to read the DB.
    } else {
      res.send("An error occured while searching the DB.");
    }
  });
});

// Delete all existing article
app.delete("/articles", function(req, res) {
  Article.deleteMany(function(err) {
    if (!err) {
      res.send("Successfully deleted all articles.")
    } else {
      res.send(err);
    }
  });
});

// Setup server on Post 3000 --> localhost:3000
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
