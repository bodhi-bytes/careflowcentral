const { MongoClient } = require("mongodb");

async function moveClients() {
  const uri = "mongodb+srv://kiranbodhi111:s8z9NCZgL8d5nQBB@cluster0.2sxqsya.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Change if using Atlas
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("test"); // 👉 replace with your DB name

    const usersCollection = db.collection("users");
    const clientCredentialsCollection = db.collection("clientcredentials");

    // Step 1: Find all users with role: "client"
    const clients = await usersCollection.find({ role: "client" }).toArray();

    if (clients.length === 0) {
      console.log("No client documents found.");
      return;
    }

    // Step 2: Insert them into clientcredentials
    await clientCredentialsCollection.insertMany(clients);
    console.log(`${clients.length} documents inserted into clientcredentials.`);

    // Step 3: Delete them from users
    const deleteResult = await usersCollection.deleteMany({ role: "client" });
    console.log(`${deleteResult.deletedCount} documents removed from users.`);

  } catch (error) {
    console.error("Error moving documents:", error);
  } finally {
    await client.close();
  }
}

moveClients();
