const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');  // Assurez-vous d'importer le modèle User

// Route d'inscription
router.post('/register', async (req, res) => {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }


    try {
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "L'utilisateur existe déjà." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);  // Hash du mot de passe
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        // Créer un token JWT
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Retourne le token d'authentification
        res.status(201).json({ token });
    }
    catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
})
