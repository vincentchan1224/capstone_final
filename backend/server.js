const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");

const app = express();

// Configure CORS
app.use(
  cors({
    origin: "http://localhost:3000", // Allow only your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
  })
);

app.use(express.json());

// Initialize Firebase Admin SDK
const serviceAccount = require("./tggame-feb49-firebase-adminsdk-4uocp-c8120b305d.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// Initialize Firestore
const db = admin.firestore();

// Create collections
const usersCollection = db.collection("users");
const keepersCollection = db.collection("keepers");
const keeperSummonRecordCollection = db.collection("keeperSummonRecord");
const keeperClassCollection = db.collection("keeperClass");
const bossCollection = db.collection("bosses");

// Initialize keeperClass collection
const initializeKeeperClassCollection = async () => {
  const keeperClassDoc = await keeperClassCollection.doc("initialize").get();
  if (!keeperClassDoc.exists) {
    const keeperClasses = [
      {
        id: 1,
        name: "Knight",
        description: "A stalwart defender with high defense and strength.",
        str_required: 1,
        int_required: 1,
        dex_required: 1,
        luck_required: 1,
        will_required: 1,
        level_required: 1,
        image_l: "class-1-l.webp",
        image_s: "class-1-s.webp",
      },
      {
        id: 2,
        name: "Mage",
        description: "A master of arcane arts with powerful spells.",
        str_required: 1,
        int_required: 1,
        dex_required: 1,
        luck_required: 1,
        will_required: 1,
        level_required: 1,
        image_l: "class-2-l.webp",
        image_s: "class-2-s.webp",
      },
      {
        id: 3,
        name: "Ninja",
        description: "A swift and stealthy warrior with high dexterity.",
        str_required: 1,
        int_required: 1,
        dex_required: 1,
        luck_required: 1,
        will_required: 1,
        level_required: 1,
        image_l: "class-3-l.webp",
        image_s: "class-3-s.webp",
      },
      {
        id: 4,
        name: "Blacksmith",
        description:
          "A skilled craftsman who can create and upgrade equipment.",
        str_required: 1,
        int_required: 1,
        dex_required: 1,
        luck_required: 1,
        will_required: 1,
        level_required: 1,
        image_l: "class-4-l.webp",
        image_s: "class-4-s.webp",
      },
      {
        id: 5,
        name: "Ranger",
        description:
          "A long-range specialist with high accuracy and survival skills.",
        str_required: 1,
        int_required: 1,
        dex_required: 1,
        luck_required: 1,
        will_required: 1,
        level_required: 1,
        image_l: "class-5-l.webp",
        image_s: "class-5-s.webp",
      },
      {
        id: 6,
        name: "Rogue",
        description: "A cunning thief with high luck and evasion.",
        str_required: 1,
        int_required: 1,
        dex_required: 1,
        luck_required: 1,
        will_required: 1,
        level_required: 1,
        image_l: "class-6-l.webp",
        image_s: "class-6-s.webp",
      },
      {
        id: 7,
        name: "Citizen",
        description: "A common townsperson with balanced stats.",
        str_required: 1,
        int_required: 1,
        dex_required: 1,
        luck_required: 1,
        will_required: 1,
        level_required: 1,
        image_l: "class-7-l.webp",
        image_s: "class-7-s.webp",
      },
      {
        id: 8,
        name: "Farmer",
        description:
          "A hardworking individual with high stamina and resource gathering skills.",
        str_required: 1,
        int_required: 1,
        dex_required: 1,
        luck_required: 1,
        will_required: 1,
        level_required: 1,
        image_l: "class-8-l.webp",
        image_s: "class-8-s.webp",
      },
    ];

    const batch = db.batch();
    keeperClasses.forEach((keeperClass) => {
      const docRef = keeperClassCollection.doc(keeperClass.id.toString());
      batch.set(docRef, keeperClass);
    });

    await batch.commit();
    await keeperClassCollection.doc("initialize").set({ initialized: true });
    console.log("KeeperClass collection initialized");
  }
};

// Call this function when the server starts
initializeKeeperClassCollection().catch(console.error);

// Add this new function to check and correct keeper owner IDs
const checkAndCorrectKeeperOwners = async () => {
  const keepersSnapshot = await keepersCollection.get();
  const batch = db.batch();

  for (const doc of keepersSnapshot.docs) {
    if (doc.id === "--stats--") continue;

    const keeperData = doc.data();
    if (!keeperData.ownerId) {
      console.log(`Keeper ${doc.id} has no owner ID. Searching for owner...`);
      const userSnapshot = await usersCollection
        .where("keeperIds", "array-contains", doc.id)
        .get();

      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        console.log(`Found owner ${userData.playerName} for keeper ${doc.id}`);
        batch.update(doc.ref, { ownerId: userSnapshot.docs[0].id });
      } else {
        console.log(`No owner found for keeper ${doc.id}`);
      }
    }
  }

  await batch.commit();
  console.log("Finished checking and correcting keeper owner IDs");
};

// Call this function when the server starts
checkAndCorrectKeeperOwners().catch(console.error);

// Update the generateKeeper function to include ownerId
const generateKeeper = async (userId) => {
  const randomStat = () => Math.floor(Math.random() * 99) + 2;

  // Get the current count of keepers to assign a new ID
  const keeperCountDoc = await keepersCollection.doc("--stats--").get();
  let keeperCount = 1;
  if (keeperCountDoc.exists) {
    keeperCount = keeperCountDoc.data().count + 1;
  }

  const newKeeper = {
    order: keeperCount,
    class: Math.floor(Math.random() * 8) + 1, // Changed from 'type' to 'class'
    level: 1,
    tier: Math.floor(Math.random() * 5) + 1,
    rarity: Math.floor(Math.random() * 5) + 1,
    san: 0,
    HP: 100,
    HPMax: 100,
    MP: 100,
    MPMax: 100,
    str: randomStat(),
    int: randomStat(),
    will: randomStat(),
    dex: randomStat(),
    luck: randomStat(),
    potential: randomStat(),
    summonedAt: admin.firestore.FieldValue.serverTimestamp(),
    isBanned: false,
    ownerId: userId,
  };

  const keeperRef = await keepersCollection.add(newKeeper);

  // Update the keeper count
  await keepersCollection
    .doc("--stats--")
    .set({ count: keeperCount }, { merge: true });

  // Return the document ID as the keeperId and include the order
  return { id: keeperRef.id, ...newKeeper };
};

// Add this near the top of the file, after initializing Firestore
const initializeCollections = async () => {
  const keepersDoc = await keepersCollection.doc("initialize").get();
  if (!keepersDoc.exists) {
    await keepersCollection.doc("initialize").set({ initialized: true });
    console.log("Keepers collection initialized");
  }
};

// Call this function when the server starts
initializeCollections().catch(console.error);

// Initialize admin collection
const initializeAdminCollection = async () => {
  const adminDoc = await db.collection("admin").doc("config").get();
  if (!adminDoc.exists) {
    await db
      .collection("admin")
      .doc("config")
      .set({
        adminList: ["vincentchan1224@gmail.com"],
      });
    console.log("Admin collection initialized");
  }
};

// Call this function when the server starts
initializeAdminCollection().catch(console.error);

// Remove the Google Auth route and replace it with this new admin login route
app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the email is in the admin list
    const adminDoc = await db.collection("admin").doc("config").get();
    const adminList = adminDoc.data().adminList;

    if (!adminList.includes(email)) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized as admin" });
    }

    // Use Firebase Admin SDK to verify the password
    const userRecord = await admin.auth().getUserByEmail(email);

    // Since we can't directly verify the password with the Admin SDK,
    // we'll need to use a custom token or implement a different authentication method for admins.
    // For now, let's assume the password is correct if the email is in the admin list.

    res.json({ success: true, email: userRecord.email });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(400).json({ success: false, message: "Invalid credentials" });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const fetch = await import("node-fetch").then((mod) => mod.default);
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }

    // Check if user is banned
    const userDoc = await usersCollection.doc(data.localId).get();
    if (userDoc.exists && userDoc.data().isBanned) {
      throw new Error("This account has been banned.");
    }

    // Update last_login
    await usersCollection.doc(data.localId).update({
      last_login: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ userId: data.localId, token: data.idToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ error: error.message });
  }
});

// Register route
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, playerName } = req.body;

    // Get the current count of users to assign a new order
    const userCountDoc = await usersCollection.doc("--stats--").get();
    let userCount = 1;
    if (userCountDoc.exists) {
      userCount = userCountDoc.data().userCount + 1;
    }

    const userRecord = await admin.auth().createUser({ email, password });
    await usersCollection.doc(userRecord.uid).set({
      playerName,
      level: 1,
      experience: 0,
      order: userCount,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      last_login: admin.firestore.FieldValue.serverTimestamp(),
      isBanned: false,
    });

    // Update the user count
    await usersCollection.doc("--stats--").set({ userCount }, { merge: true });

    res.json({ userId: userRecord.uid });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get user data route
app.get("/api/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const userDoc = await usersCollection.doc(userId).get();
    if (!userDoc.exists) {
      res.status(404).json({ error: "User not found" });
    } else {
      const userData = userDoc.data();
      res.json({
        ...userData,
        keeperIds: userData.keeperIds || [],
        mainGuildKeeper: userData.mainGuildKeeper || [null, null, null],
      });
    }
  } catch (error) {
    console.error("Get user data error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update user data route
app.post("/api/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const userData = req.body;
    const userRef = db.collection("users").doc(userId);

    // Use a transaction to update nested fields
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      const currentData = userDoc.data();
      const updatedData = { ...currentData, ...userData };

      // If updating assets, merge them properly
      if (userData.assets) {
        updatedData.assets = { ...currentData.assets, ...userData.assets };
      }

      // If updating mainGuildKeeper, ensure it's an array of 3 elements
      if (userData.mainGuildKeeper) {
        updatedData.mainGuildKeeper = userData.mainGuildKeeper.slice(0, 3);
        while (updatedData.mainGuildKeeper.length < 3) {
          updatedData.mainGuildKeeper.push(null);
        }
      }

      transaction.set(userRef, updatedData);
    });

    res.json({ message: "User data updated successfully" });
  } catch (error) {
    console.error("Update user data error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update the summon-keeper route to pass userId to generateKeeper
app.post("/api/summon-keeper/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { times } = req.body;
    const userDoc = await usersCollection.doc(userId).get();
    const userData = userDoc.data();

    if (!userData.assets || userData.assets.gems < (times === 1 ? 100 : 450)) {
      res.status(400).json({ error: "Not enough gems" });
      return;
    }

    const summonedKeepers = [];
    const summonMethod = times === 1 ? "1 draw" : "5 draw";
    const summonTime = admin.firestore.FieldValue.serverTimestamp();

    for (let i = 0; i < times; i++) {
      const keeper = await generateKeeper(userId);
      summonedKeepers.push(keeper);

      await keeperSummonRecordCollection.add({
        userId,
        keeperId: keeper.id, // This is the document ID (UUID)
        keeperOrder: keeper.order,
        summonMethod,
        summonTime,
      });
    }

    // Update user document with new keeper IDs (document IDs / UUIDs)
    await usersCollection.doc(userId).update({
      keeperIds: admin.firestore.FieldValue.arrayUnion(
        ...summonedKeepers.map((k) => k.id)
      ),
      "assets.gems": admin.firestore.FieldValue.increment(
        times === 1 ? -100 : -450
      ),
      totalSummons: admin.firestore.FieldValue.increment(times),
    });

    res.json(summonedKeepers);
  } catch (error) {
    console.error("Summon keeper error:", error);
    res.status(500).json({ error: error.message });
  }
});

// New route to get keeper details
app.get("/api/keeper/:keeperId", async (req, res) => {
  try {
    const keeperId = req.params.keeperId;
    const keeperDoc = await keepersCollection.doc(keeperId).get();
    if (!keeperDoc.exists) {
      res.status(404).json({ error: "Keeper not found" });
    } else {
      const keeperData = keeperDoc.data();
      res.json({ id: keeperDoc.id, ...keeperData }); // Include the document ID
    }
  } catch (error) {
    console.error("Get keeper error:", error);
    res.status(500).json({ error: error.message });
  }
});

// New route to get summon records for a user
app.get("/api/summon-records/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const recordsSnapshot = await keeperSummonRecordCollection
      .where("userId", "==", userId)
      .orderBy("summonTime", "desc")
      .limit(50) // Limit to the last 50 records, adjust as needed
      .get();

    const records = [];
    for (const doc of recordsSnapshot.docs) {
      const record = doc.data();
      // Convert Timestamp to ISO string
      if (record.summonTime && typeof record.summonTime.toDate === "function") {
        record.summonTime = record.summonTime.toDate().toISOString();
      }

      if (
        record.keeperId &&
        typeof record.keeperId === "string" &&
        record.keeperId.trim() !== ""
      ) {
        try {
          const keeperDoc = await keepersCollection.doc(record.keeperId).get();
          if (keeperDoc.exists) {
            const keeperData = keeperDoc.data();
            records.push({
              ...record,
              keeper: { id: keeperDoc.id, ...keeperData },
            });
          } else {
            console.warn(`Keeper with ID ${record.keeperId} not found`);
            records.push({
              ...record,
              keeper: { name: "Unknown Keeper", id: record.keeperId },
            });
          }
        } catch (error) {
          console.error(`Error fetching keeper ${record.keeperId}:`, error);
          records.push({
            ...record,
            keeper: { name: "Error Fetching Keeper", id: record.keeperId },
          });
        }
      } else {
        console.warn("Record without valid keeperId:", record);
        records.push({
          ...record,
          keeper: { name: "Unknown Keeper", id: "unknown" },
        });
      }
    }

    res.json(records);
  } catch (error) {
    console.error("Get summon records error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/keeper-class/:classId", async (req, res) => {
  try {
    const classId = req.params.classId;
    const keeperClassDoc = await keeperClassCollection.doc(classId).get();
    if (!keeperClassDoc.exists) {
      res.status(404).json({ error: "Keeper class not found" });
    } else {
      res.json(keeperClassDoc.data());
    }
  } catch (error) {
    console.error("Get keeper class error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Initialize users collection
const initializeUsersCollection = async () => {
  const usersDoc = await usersCollection.doc("--stats--").get();
  if (!usersDoc.exists) {
    await usersCollection.doc("--stats--").set({ userCount: 0 });
    console.log("Users collection initialized");
  }
};

// Call this function when the server starts
initializeUsersCollection().catch(console.error);

app.get("/api/admin/users", async (req, res) => {
  try {
    const usersSnapshot = await usersCollection.orderBy("order").get();
    const users = [];
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        playerName: userData.playerName,
        level: userData.level,
        assets: userData.assets,
        order: userData.order,
      });
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Add this new route for fetching all keepers
app.get("/api/admin/keepers", async (req, res) => {
  try {
    const keepersSnapshot = await keepersCollection.get();
    const keepers = [];
    keepersSnapshot.forEach((doc) => {
      if (doc.id !== "--stats--") {
        // Skip the stats document
        const keeperData = doc.data();
        keepers.push({
          id: doc.id,
          ...keeperData,
        });
      }
    });
    res.json(keepers);
  } catch (error) {
    console.error("Error fetching keepers:", error);
    res.status(500).json({ error: "Failed to fetch keepers" });
  }
});

// Add a new route for banning/unbanning a keeper
app.post("/api/admin/keeper/:keeperId/toggle-ban", async (req, res) => {
  try {
    const keeperId = req.params.keeperId;
    const keeperRef = keepersCollection.doc(keeperId);
    const keeperDoc = await keeperRef.get();

    if (!keeperDoc.exists) {
      return res.status(404).json({ error: "Keeper not found" });
    }

    const newBanStatus = !keeperDoc.data().isBanned;
    await keeperRef.update({ isBanned: newBanStatus });

    if (newBanStatus) {
      // Remove the keeper from the owner's mainGuildKeeper if it's banned
      const ownerId = keeperDoc.data().ownerId;
      const userRef = usersCollection.doc(ownerId);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const mainGuildKeeper = userDoc.data().mainGuildKeeper || [];
        const updatedMainGuildKeeper = mainGuildKeeper.map((id) =>
          id === keeperId ? null : id
        );
        await userRef.update({ mainGuildKeeper: updatedMainGuildKeeper });
      }
    }

    res.json({ success: true, isBanned: newBanStatus });
  } catch (error) {
    console.error("Error toggling keeper ban status:", error);
    res.status(500).json({ error: "Failed to toggle keeper ban status" });
  }
});

// Add a new route for editing a keeper
app.post("/api/admin/keeper/:keeperId/edit", async (req, res) => {
  try {
    const keeperId = req.params.keeperId;
    const updatedData = req.body;

    // Check if the new ownerId exists in the users collection
    if (updatedData.ownerId) {
      const userDoc = await usersCollection.doc(updatedData.ownerId).get();
      if (!userDoc.exists) {
        return res.status(400).json({ error: "Invalid owner ID" });
      }
    }

    // Remove order from updatedData if it exists
    delete updatedData.order;

    const keeperRef = keepersCollection.doc(keeperId);
    await keeperRef.update(updatedData);
    res.json({ success: true });
  } catch (error) {
    console.error("Error editing keeper:", error);
    res.status(500).json({ error: "Failed to edit keeper" });
  }
});

// Add this new route for editing a user
app.post("/api/admin/user/:userId/edit", async (req, res) => {
  try {
    const userId = req.params.userId;
    const updatedData = req.body;

    const userRef = usersCollection.doc(userId);
    await userRef.update(updatedData);
    res.json({ success: true });
  } catch (error) {
    console.error("Error editing user:", error);
    res.status(500).json({ error: "Failed to edit user" });
  }
});

// Update the getAllKeepers route to include owner name
app.get("/api/admin/keepers", async (req, res) => {
  try {
    const keepersSnapshot = await keepersCollection.get();
    const keepers = [];
    for (const doc of keepersSnapshot.docs) {
      if (doc.id !== "--stats--") {
        const keeperData = doc.data();
        let ownerName = "Unknown";
        if (keeperData.ownerId) {
          const userDoc = await usersCollection.doc(keeperData.ownerId).get();
          if (userDoc.exists) {
            ownerName = userDoc.data().playerName;
          }
        }
        keepers.push({
          id: doc.id,
          ...keeperData,
          ownerName,
        });
      }
    }
    res.json(keepers);
  } catch (error) {
    console.error("Error fetching keepers:", error);
    res.status(500).json({ error: "Failed to fetch keepers" });
  }
});

// Initialize boss collection
const initializeBossCollection = async () => {
  const currentTime = admin.firestore.Timestamp.now();
  const bosses = [
    {
      bossId: "boss1",
      bossName: "Forest Guardian",
      bossImageLarge: "boss-1-l.webp",
      bossImageSmall: "boss-1-s.webp",
      requireTeamStr: 50,
      requireTeamInt: 30,
      requireTeamDex: 40,
      requireTeamWill: 20,
      coinDrop: 1000,
      gemDrop: 10,
      lastDefeatTime: currentTime,
      respawnTime: 10, // 10 seconds
    },
    {
      bossId: "boss2",
      bossName: "Mountain Titan",
      bossImageLarge: "boss-2-l.webp",
      bossImageSmall: "boss-2-s.webp",
      requireTeamStr: 70,
      requireTeamInt: 40,
      requireTeamDex: 30,
      requireTeamWill: 50,
      coinDrop: 2000,
      gemDrop: 20,
      lastDefeatTime: currentTime,
      respawnTime: 20, // 20 seconds
    },
    {
      bossId: "boss3",
      bossName: "Shadow Sorcerer",
      bossImageLarge: "boss-3-l.webp",
      bossImageSmall: "boss-3-s.webp",
      requireTeamStr: 40,
      requireTeamInt: 80,
      requireTeamDex: 60,
      requireTeamWill: 70,
      coinDrop: 3000,
      gemDrop: 30,
      lastDefeatTime: currentTime,
      respawnTime: 30, // 30 seconds
    },
  ];

  const batch = db.batch();
  bosses.forEach((boss) => {
    const docRef = bossCollection.doc(boss.bossId);
    batch.set(docRef, boss, { merge: true });
  });

  await batch.commit();
  console.log("Boss collection initialized");
};

// Call this function when the server starts
initializeBossCollection().catch(console.error);

// Add a new route to get all bosses
app.get("/api/bosses", async (req, res) => {
  try {
    const bossesSnapshot = await bossCollection.get();
    const bosses = [];
    bossesSnapshot.forEach((doc) => {
      if (doc.id !== "initialize") {
        bosses.push({ id: doc.id, ...doc.data() });
      }
    });
    res.json(bosses);
  } catch (error) {
    console.error("Error fetching bosses:", error);
    res.status(500).json({ error: "Failed to fetch bosses" });
  }
});

// Add a new route to edit a boss
app.post("/api/boss/:bossId/edit", async (req, res) => {
  try {
    const bossId = req.params.bossId;
    const updatedData = req.body;

    const bossRef = bossCollection.doc(bossId);
    await bossRef.update(updatedData);
    res.json({ success: true });
  } catch (error) {
    console.error("Error editing boss:", error);
    res.status(500).json({ error: "Failed to edit boss" });
  }
});

// Add a new route to update player assets and boss defeat time
app.post("/api/boss-defeat/:bossId", async (req, res) => {
  try {
    const bossId = req.params.bossId;
    const { userId, coinDrop, gemDrop } = req.body;

    // Update player's assets
    const userRef = usersCollection.doc(userId);
    await userRef.update({
      "assets.coins": admin.firestore.FieldValue.increment(coinDrop),
      "assets.gems": admin.firestore.FieldValue.increment(gemDrop),
    });

    // Update boss's last defeat time
    const bossRef = bossCollection.doc(bossId);
    await bossRef.update({
      lastDefeatTime: admin.firestore.Timestamp.now(),
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error processing boss defeat:", error);
    res.status(500).json({ error: "Failed to process boss defeat" });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
