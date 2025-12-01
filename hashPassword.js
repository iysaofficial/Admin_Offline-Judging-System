// hashPassword.js
const bcrypt = require("bcryptjs");

const password = "admin123";
const saltRounds = 10;

async function generateHash() {
  const hash = await bcrypt.hash(password, saltRounds);
  console.log("Hashed password:", hash);
}

generateHash();
