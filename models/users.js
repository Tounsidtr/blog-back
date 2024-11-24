const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" }, // Champ 'role'
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
  updatedAt: {
    type: Date,
    default: () => Date.now(),
  },
});

// Middleware avant la sauvegarde pour hasher le mot de passe
// userSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   this.updatedAt = Date.now();
//   next();
// });

// // Méthode pour comparer les mots de passe
// userSchema.methods.matchPassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

const User = mongoose.model("users", userSchema);

module.exports = User;