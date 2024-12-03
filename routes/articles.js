const { checkBody } = require("../modules/checkBody");
const Article = require("../models/articles");
const User = require("../models/users");
var express = require("express");
var router = express.Router();
const { auth } = require("../middleware/auth");

/* GET users listing. */
router.get("/", async (req, res) => {
    const data = await Article.find()
        .populate("author")
    res.json({ result: true, data });

})
router.get("/:articleId", async (req, res) => {
    const data = await Article.findById(req.params.articleId)

    if (data) {
        res.json({ result: true, data });
    } else {
        res.json({ result: false, error: "Cet article n'existe pas !" });
    }

});

router.post("/create", auth, async (req, res) => {
    const { title, imageUrl, content } = req.body;
    const userId = req.user.id;
    
    
    if (!title || !content || !imageUrl) {
      return res.status(400).json({ message: 'Tous les champs sont nécessaires.' });
    }
  
    try {
      const newArticle = new Article({
        title,
        content,
        image: imageUrl,
        author: userId,
      });
  
      await newArticle.save();
      const article = await Article.find().populate("author")
      res.status(201).json({ message: 'Article créé avec succès', data: article});
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création de l\'article' });
    }
  });
  

router.put("/:articleId", auth, async (req, res) => {
    const data = await Article.findById(req.params.articleId)
        .populate("author")
    if (data) {
        const { title, imageUrl, content } = req.body;
        if (!checkBody(req.body, ["title", "content"])) {
            return res
                .status(400)
                .json({ result: false, error: "Missing or empty fields." });
        }
        if (
            req.user.id === data.author._id.toString()
        ) {
            await Article.updateOne(
                { _id: req.params.articleId },
                {
                    $set: {
                        title,
                        image: imageUrl,
                        content,
                        updateDatetime: Date.now(),
                    },
                },
                { new: true }
            )
            const resultat = await Article.find()
                .populate("author")
            res.json({ result: true, data: resultat });
        } else {
            res.status(401).json({ result: false, error: "Not authorized !" });
        }
    } else {
        res.json({ result: false, error: "L'article n'existe pas!" });
    }
});

router.delete("/:articleId", auth, async (req, res) => {
    const data = await Article.findById(req.params.articleId)
        .populate("author")
    if (data) {
        if (
            req.user.id === data.author._id.toString()
        ) {
            await Article.deleteOne({ _id: req.params.articleId })
            const resultats = await Article.find()
                .populate("author")
            res.json({
                result: true,
                data: resultats,
                message: "Article supprimé",
            });
        } else {
            res.status(401).json({ result: false, error: "Not authorized !" });
        }
    } else {
        res.json({ result: false, error: "L'article n'existe pas!" });
    }
});
router.get("/author/:author", auth, async (req, res) => {
    const data = await User.find({ _id: req.params.author })
    if (data) {
        const resultat = await Article.find({ author: req.params.author })
            .populate("author")
        res.json({ result: true, data: resultat });
    } else {
        res.json({ result: false, error: "Utilisateur introuvable !" });
    }
});

module.exports = router;