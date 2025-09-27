import bcrypt from "bcrypt";

async function testBcrypt() {
  const password = "test123";
  const hash = "$2b$10$hOvOZ12VbpKCSfhf2b6IZOTFieUQ1lhYGj33xK6z2iJpQ7NtY/5PW";

  console.log("Password:", password);
  console.log("Hash:", hash);
  console.log("Hash type:", typeof hash);
  console.log("Hash length:", hash.length);

  try {
    const result = await bcrypt.compare(password, hash);
    console.log("Bcrypt compare result:", result);
  } catch (error) {
    console.error("Bcrypt error:", error);
  }
}

testBcrypt();