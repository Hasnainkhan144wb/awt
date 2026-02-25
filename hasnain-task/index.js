import { MongoClient } from "mongodb";
import readline from "readline";

// Connection URL (local MongoDB)
const url = "mongodb://127.0.0.1:27017"; 
const client = new MongoClient(url);

// Database name
const dbName = "ecomerceDB";

// Connection name
const connectionName = "hasnainkhan";

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Main menu
async function showMainMenu(db) {
  console.log("\n========================================");
  console.log("       MAIN MENU");
  console.log("========================================");
  console.log("Select Collection:");
  console.log("1. Customers");
  console.log("2. Orders");
  console.log("3. Products");
  console.log("0. Exit");
  console.log("========================================\n");

  const choice = await askQuestion("Enter your choice: ");
  
  switch(choice) {
    case "1": await collectionMenu(db, "customers"); break;
    case "2": await collectionMenu(db, "orders"); break;
    case "3": await collectionMenu(db, "products"); break;
    case "0": 
      console.log("Goodbye!");
      await client.close();
      rl.close();
      process.exit(0);
    default:
      console.log("Invalid choice!");
  }
  
  await showMainMenu(db);
}

// Collection operations menu
async function collectionMenu(db, collectionName) {
  console.log("\n========================================");
  console.log("    " + collectionName.toUpperCase() + " COLLECTION");
  console.log("========================================");
  console.log("1. Insert Document");
  console.log("2. Find All Documents");
  console.log("3. Find One Document");
  console.log("4. Search Documents");
  console.log("5. Sort Documents");
  console.log("6. Update Document");
  console.log("7. Delete Document");
  console.log("8. Aggregate Functions");
  console.log("9. Back to Main Menu");
  console.log("========================================\n");

  const choice = await askQuestion("Enter your choice: ");
  
  switch(choice) {
    case "1": 
      if (collectionName === "customers") await insertCustomer(db);
      else if (collectionName === "orders") await insertOrder(db);
      else await insertProduct(db);
      break;
    case "2": 
      if (collectionName === "customers") await findAllCustomers(db);
      else if (collectionName === "orders") await findAllOrders(db);
      else await findAllProducts(db);
      break;
    case "3": 
      if (collectionName === "customers") await findOneCustomer(db);
      else if (collectionName === "orders") await findOneOrder(db);
      else await findOneProduct(db);
      break;
    case "4": await searchInCollection(db, collectionName); break;
    case "5": await sortInCollection(db, collectionName); break;
    case "6": await updateInCollection(db, collectionName); break;
    case "7": await deleteInCollection(db, collectionName); break;
    case "8": await aggregateInCollection(db, collectionName); break;
    case "9": return;
    default:
      console.log("Invalid choice!");
  }
  
  await collectionMenu(db, collectionName);
}

// Search in specific collection
async function searchInCollection(db, collectionName) {
  const searchTerm = await askQuestion("Enter search term (field:value): ");
  const [field, value] = searchTerm.split(":");
  
  const searchQuery = {};
  if (field && value) {
    searchQuery[field] = isNaN(value) ? value : Number(value);
  }

  const results = await db.collection(collectionName).find(searchQuery).toArray();
  console.log("\nSearch Results:", results);
}

// Sort in specific collection
async function sortInCollection(db, collectionName) {
  const sortField = await askQuestion("Enter sort field: ");
  const sortOrder = await askQuestion("Enter sort order (1=asc, -1=desc): ");
  
  const sortObj = {};
  sortObj[sortField] = parseInt(sortOrder);

  const results = await db.collection(collectionName).find({}).sort(sortObj).toArray();
  console.log("\nSorted Results:", results);
}

// Update in specific collection
async function updateInCollection(db, collectionName) {
  const updateField = await askQuestion("Enter field to update by: ");
  const updateValue = await askQuestion("Enter value to match: ");
  const newField = await askQuestion("Enter field to change: ");
  const newValue = await askQuestion("Enter new value: ");
  
  const filterQuery = {};
  filterQuery[updateField] = isNaN(updateValue) ? updateValue : Number(updateValue);
  
  const updateQuery = {};
  updateQuery[newField] = isNaN(newValue) ? newValue : Number(newValue);

  const result = await db.collection(collectionName).updateOne(filterQuery, { $set: updateQuery });
  console.log("Updated:", result.modifiedCount, "document(s)");
}

// Delete in specific collection
async function deleteInCollection(db, collectionName) {
  const deleteField = await askQuestion("Enter field to delete by: ");
  const deleteValue = await askQuestion("Enter value: ");
  
  const deleteQuery = {};
  deleteQuery[deleteField] = isNaN(deleteValue) ? deleteValue : Number(deleteValue);

  const result = await db.collection(collectionName).deleteOne(deleteQuery);
  console.log("Deleted:", result.deletedCount, "document(s)");
}

// Aggregate in specific collection
async function aggregateInCollection(db, collectionName) {
  if (collectionName === "customers") {
    const count = await db.collection("customers").countDocuments();
    console.log("\nTotal Customers:", count);
  } else if (collectionName === "orders") {
    console.log("1. Count Orders");
    console.log("2. Total Order Value");
    const choice = await askQuestion("Enter choice: ");
    if (choice === "1") {
      const count = await db.collection("orders").countDocuments();
      console.log("\nTotal Orders:", count);
    } else if (choice === "2") {
      const result = await db.collection("orders").aggregate([
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]).toArray();
      console.log("\nTotal Order Value:", result);
    }
  } else if (collectionName === "products") {
    console.log("1. Count Products");
    console.log("2. Average Product Price");
    const choice = await askQuestion("Enter choice: ");
    if (choice === "1") {
      const count = await db.collection("products").countDocuments();
      console.log("\nTotal Products:", count);
    } else if (choice === "2") {
      const result = await db.collection("products").aggregate([
        { $group: { _id: null, avgPrice: { $avg: "$price" } } }
      ]).toArray();
      console.log("\nAverage Product Price:", result);
    }
  }
}

// ==================== CUSTOMERS MENU ====================
async function customersMenu(db) {
  const collection = db.collection("customers");
  console.log("\n---  CUSTOMERS COLLECTION ---");
  console.log("1.  Insert Customer");
  console.log("2.  Find All Customers");
  console.log("3.  Find One Customer");
  console.log("4.  Back to Main Menu");

  const choice = await askQuestion("Enter choice: ");
  
  switch(choice) {
    case "1": await insertCustomer(db); break;
    case "2": await findAllCustomers(db); break;
    case "3": await findOneCustomer(db); break;
    case "4": return;
  }
  await customersMenu(db);
}

async function insertCustomer(db) {
  const collection = db.collection("customers");
  const name = await askQuestion("Enter customer name: ");
  const age = await askQuestion("Enter age: ");
  const city = await askQuestion("Enter city: ");
  const gender = await askQuestion("Enter gender: ");
  
  const customer = {
    name,
    age: parseInt(age),
    city,
    gender
  };
  
  const result = await collection.insertOne(customer);
  console.log(" Customer inserted! ID:", result.insertedId);
}

async function findAllCustomers(db) {
  const collection = db.collection("customers");
  const customers = await collection.find({}).toArray();
  console.log("\n All Customers:");
  console.log(JSON.stringify(customers, null, 2));
}

async function findOneCustomer(db) {
  const collection = db.collection("customers");
  const name = await askQuestion("Enter customer name to search: ");
  const customer = await collection.findOne({ name });
  if (customer) {
    console.log("\n Customer Found:");
    console.log(JSON.stringify(customer, null, 2));
  } else {
    console.log(" Customer not found!");
  }
}

// ==================== ORDERS MENU ====================
async function ordersMenu(db) {
  const collection = db.collection("orders");
  console.log("\n---  ORDERS COLLECTION ---");
  console.log("1. Insert Order");
  console.log("2.  Find All Orders");
  console.log("3.  Find One Order");
  console.log("4.  Back to Main Menu");

  const choice = await askQuestion("Enter choice: ");
  
  switch(choice) {
    case "1": await insertOrder(db); break;
    case "2": await findAllOrders(db); break;
    case "3": await findOneOrder(db); break;
    case "4": return;
  }
  await ordersMenu(db);
}

async function insertOrder(db) {
  const collection = db.collection("orders");
  const customerName = await askQuestion("Enter customer name: ");
  const productName = await askQuestion("Enter product name: ");
  const quantity = await askQuestion("Enter quantity: ");
  const total = await askQuestion("Enter total amount: ");
  
  const order = {
    customerName,
    productName,
    quantity: parseInt(quantity),
    total: total
  };
  
  const result = await collection.insertOne(order);
  console.log(" Order inserted! ID:", result.insertedId);
}

async function findAllOrders(db) {
  const collection = db.collection("orders");
  const orders = await collection.find({}).toArray();
  console.log("\n All Orders:");
  console.log(JSON.stringify(orders, null, 2));
}

async function findOneOrder(db) {
  const collection = db.collection("orders");
  const customerName = await askQuestion("Enter customer name to search: ");
  const order = await collection.findOne({ customerName });
  if (order) {
    console.log("\n Order Found:");
    console.log(JSON.stringify(order, null, 2));
  } else {
    console.log(" Order not found!");
  }
}

// ==================== PRODUCTS MENU ====================
async function productsMenu(db) {
  const collection = db.collection("products");
  console.log("\n---  PRODUCTS COLLECTION ---");
  console.log("1.  Insert Product");
  console.log("2.  Find All Products");
  console.log("3.  Find One Product");
  console.log("4.  Back to Main Menu");

  const choice = await askQuestion("Enter choice: ");
  
  switch(choice) {
    case "1": await insertProduct(db); break;
    case "2": await findAllProducts(db); break;
    case "3": await findOneProduct(db); break;
    case "4": return;
  }
  await productsMenu(db);
}

async function insertProduct(db) {
  const collection = db.collection("products");
  const name = await askQuestion("Enter product name: ");
  const category = await askQuestion("Enter category: ");
  const price = await askQuestion("Enter price: ");
  const stock = await askQuestion("Enter stock quantity: ");
  
  const product = {
    name,
    category,
    price: parseInt(price),
    stock: parseInt(stock)
  };
  
  const result = await collection.insertOne(product);
  console.log("Product inserted! ID:", result.insertedId);
}

async function findAllProducts(db) {
  const collection = db.collection("products");
  const products = await collection.find({}).toArray();
  console.log("\n All Products:");
  console.log(JSON.stringify(products, null, 2));
}

async function findOneProduct(db) {
  const collection = db.collection("products");
  const name = await askQuestion("Enter product name to search: ");
  const product = await collection.findOne({ name });
  if (product) {
    console.log("\n Product Found:");
    console.log(JSON.stringify(product, null, 2));
  } else {
    console.log(" Product not found!");
  }
}

// ==================== SEARCH MENU ====================
async function searchMenu(db) {
  console.log("\n---  SEARCH DOCUMENTS ---");
  console.log("1. Search in Customers");
  console.log("2. Search in Orders");
  console.log("3. Search in Products");
  console.log("4. 🔙 Back");

  const choice = await askQuestion("Enter choice: ");
  const searchTerm = await askQuestion("Enter search term (field:value): ");
  const [field, value] = searchTerm.split(":");
  
  const searchQuery = {};
  if (field && value) {
    searchQuery[field] = isNaN(value) ? value : Number(value);
  }

  switch(choice) {
    case "1": {
      const results = await db.collection("customers").find(searchQuery).toArray();
      console.log("\n Search Results (Customers):", results);
      break;
    }
    case "2": {
      const results = await db.collection("orders").find(searchQuery).toArray();
      console.log("\nSearch Results (Orders):", results);
      break;
    }
    case "3": {
      const results = await db.collection("products").find(searchQuery).toArray();
      console.log("\n Search Results (Products):", results);
      break;
    }
    case "4": return;
  }
  await searchMenu(db);
}

// ==================== SORT MENU ====================
async function sortMenu(db) {
  console.log("\n--- ↕ SORT DOCUMENTS ---");
  console.log("1. Sort Customers");
  console.log("2. Sort Orders");
  console.log("3. Sort Products");
  console.log("4.  Back");

  const choice = await askQuestion("Enter choice: ");
  const sortField = await askQuestion("Enter sort field: ");
  const sortOrder = await askQuestion("Enter sort order (1=asc, -1=desc): ");
  
  const sortObj = {};
  sortObj[sortField] = parseInt(sortOrder);

  let collection;
  switch(choice) {
    case "1": collection = "customers"; break;
    case "2": collection = "orders"; break;
    case "3": collection = "products"; break;
    case "4": return;
  }

  const results = await db.collection(collection).find({}).sort(sortObj).toArray();
  console.log("\n↕ Sorted Results:", results);
  await sortMenu(db);
}

// ==================== AGGREGATE MENU ====================
async function aggregateMenu(db) {
  console.log("\n---  AGGREGATE FUNCTIONS ---");
  console.log("1. Count Customers");
  console.log("2. Count Orders");
  console.log("3. Count Products");
  console.log("4. Total Order Value (Orders)");
  console.log("5. Average Product Price (Products)");
  console.log("6.  Back");

  const choice = await askQuestion("Enter choice: ");

  switch(choice) {
    case "1": {
      const count = await db.collection("customers").countDocuments();
      console.log("\n Total Customers:", count);
      break;
    }
    case "2": {
      const count = await db.collection("orders").countDocuments();
      console.log("\n Total Orders:", count);
      break;
    }
    case "3": {
      const count = await db.collection("products").countDocuments();
      console.log("\nTotal Products:", count);
      break;
    }
    case "4": {
      const result = await db.collection("orders").aggregate([
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]).toArray();
      console.log("\n Total Order Value:", result);
      break;
    }
    case "5": {
      const result = await db.collection("products").aggregate([
        { $group: { _id: null, avgPrice: { $avg: "$price" } } }
      ]).toArray();
      console.log("\n Average Product Price:", result);
      break;
    }
    case "6": return;
  }
  await aggregateMenu(db);
}

// ==================== DELETE MENU ====================
async function deleteMenu(db) {
  console.log("\n---  DELETE DOCUMENTS ---");
  console.log("1. Delete from Customers");
  console.log("2. Delete from Orders");
  console.log("3. Delete from Products");
  console.log("4. Back");

  const choice = await askQuestion("Enter choice: ");
  const deleteField = await askQuestion("Enter field to delete by: ");
  const deleteValue = await askQuestion("Enter value: ");
  
  const deleteQuery = {};
  deleteQuery[deleteField] = isNaN(deleteValue) ? deleteValue : Number(deleteValue);

  let collectionName;
  switch(choice) {
    case "1": collectionName = "customers"; break;
    case "2": collectionName = "orders"; break;
    case "3": collectionName = "products"; break;
    case "4": return;
  }

  const result = await db.collection(collectionName).deleteOne(deleteQuery);
  console.log(" Deleted:", result.deletedCount, "document(s)");
  await deleteMenu(db);
}

// ==================== UPDATE MENU ====================
async function updateMenu(db) {
  console.log("\n---  UPDATE DOCUMENTS ---");
  console.log("1. Update in Customers");
  console.log("2. Update in Orders");
  console.log("3. Update in Products");
  console.log("4. Back");

  const choice = await askQuestion("Enter choice: ");
  const updateField = await askQuestion("Enter field to update by: ");
  const updateValue = await askQuestion("Enter value to match: ");
  const newField = await askQuestion("Enter field to change: ");
  const newValue = await askQuestion("Enter new value: ");
  
  const filterQuery = {};
  filterQuery[updateField] = isNaN(updateValue) ? updateValue : Number(updateValue);
  
  const updateQuery = {};
  updateQuery[newField] = isNaN(newValue) ? newValue : Number(newValue);

  let collectionName;
  switch(choice) {
    case "1": collectionName = "customers"; break;
    case "2": collectionName = "orders"; break;
    case "3": collectionName = "products"; break;
    case "4": return;
  }

  const result = await db.collection(collectionName).updateOne(filterQuery, { $set: updateQuery });
  console.log("Updated:", result.modifiedCount, "document(s)");
  await updateMenu(db);
}

// ==================== MAIN FUNCTION ====================
async function main() {
  try {
    // Connect the client
    await client.connect();
    console.log(" Connected to MongoDB!");
    
    const db = client.db(dbName);
    
    // Show collections info
    console.log("\n Collections: customers, orders, products");
    
    // Start the main menu
    await showMainMenu(db);

  } catch (err) {
    console.error("Error:", err);
    rl.close();
  }
}

main();
