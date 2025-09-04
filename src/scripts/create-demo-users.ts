import dotenv from "dotenv";
dotenv.config();

// Simple script to create users via Better Auth API calls
async function createDemoUsers() {
  console.log("🌱 Creating demo users via Better Auth API...");
  
  const baseUrl = process.env.BETTER_AUTH_URL;
  
  try {
    // Create admin user
    console.log("Creating admin user...");
    const adminResponse = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Institution Admin',
        email: 'admin@school.edu',
        password: 'admin123'
      })
    });
    
    if (adminResponse.ok) {
      console.log("✅ Admin user created successfully");
    } else {
      const error = await adminResponse.text();
      console.log("⚠️ Admin user:", error);
    }
    
    // Create parent user
    console.log("Creating parent user...");
    const parentResponse = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Parent User',
        email: 'parent@example.com',
        password: 'parent123'
      })
    });
    
    if (parentResponse.ok) {
      console.log("✅ Parent user created successfully");
    } else {
      const error = await parentResponse.text();
      console.log("⚠️ Parent user:", error);
    }
    
    console.log("");
    console.log("🎉 Demo users created!");
    console.log("You can now login with:");
    console.log("- admin@school.edu / admin123");
    console.log("- parent@example.com / parent123");
    
  } catch (error) {
    console.error("❌ Error creating users:", error);
  }
}

createDemoUsers();