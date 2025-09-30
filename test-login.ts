import { auth } from "./src/server/auth";

async function testLogin() {
  console.log("Testing admin login...");

  try {
    const result = await auth.api.signInEmail({
      body: {
        email: "admin@myfee.com",
        password: "admin123",
      },
    });

    console.log("Login successful:", result);
  } catch (error) {
    console.error("Login failed:", error);
  }
}

testLogin();