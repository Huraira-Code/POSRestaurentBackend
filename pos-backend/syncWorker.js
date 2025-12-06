const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config();

const LOCAL_DB_URI = "mongodb+srv://huraira:Usama10091@cluster0.hnawam1.mongodb.net/POSRestaurented";
const REMOTE_DB_URI = "mongodb+srv://huraira:Usama10091@cluster0.hnawam1.mongodb.net/POSRestaurented2";

// Create separate connections
const localConnection = mongoose.createConnection(LOCAL_DB_URI);
const remoteConnection = mongoose.createConnection(REMOTE_DB_URI);

async function canConnectRemote() {
  try {
    await remoteConnection.db.admin().ping();
    return true;
  } catch {
    return false;
  }
}

async function syncModel(modelName, schema) {
  const LocalModel = localConnection.model(modelName, schema);
  const RemoteModel = remoteConnection.model(modelName, schema);

  console.log(`🔄 Syncing model: ${modelName}`);

  // Disable validation (IMPORTANT FIX)
  schema.set("validateBeforeSave", false);
  schema.set("strict", false);

  // 1️⃣ Get all remote data
  const remoteDocs = await RemoteModel.find({}).lean();

  // 2️⃣ DELETE all local data
  await LocalModel.deleteMany({});
  console.log(`🗑️ Cleared local data for ${modelName}`);

  // 3️⃣ Insert remote docs without validation
  if (remoteDocs.length > 0) {
    await LocalModel.insertMany(remoteDocs, {
      ordered: false, // continue even if some docs fail
      rawResult: false
    });
    console.log(`📥 Copied ${remoteDocs.length} documents to Local (${modelName})`);
  } else {
    console.log(`⚠️ Remote has 0 docs for ${modelName}`);
  }
}


async function syncAllModels() {
  const online = await canConnectRemote();
  if (!online) {
    console.log("🚫 Offline - retrying in 10 seconds...");
    return;
  }

  console.log("🌐 Online - syncing started");

  // Load all models
  const modelFiles = fs.readdirSync("./models").filter(f => f.endsWith(".js"));

  for (let file of modelFiles) {
    const model = require(`./models/${file}`);
    const modelName = model.modelName;
    const schema = model.schema;

    await syncModel(modelName, schema);
    console.log(`✅ Finished syncing: ${modelName}\n`);
  }

  console.log("🎉 Sync cycle completed!\n");
}

// Start sync
(async () => {
  await localConnection.asPromise();
  await remoteConnection.asPromise();

  console.log("🔗 Connected to both Local & Remote MongoDB");

  // Sync every 10 seconds
  setInterval(syncAllModels, 10 * 1000);
})();
