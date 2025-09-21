from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database connection
mongodb_url = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
database_name = os.getenv("DATABASE_NAME", "becs_db")

try:
    client = MongoClient(mongodb_url)
    database = client[database_name]
    print(f"Connected to MongoDB: {mongodb_url}")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    database = None

# Blood compatibility matrix
COMPATIBILITY_MATRIX = {
    "A+": ["A+", "AB+"],
    "A-": ["A+", "A-", "AB+", "AB-"],
    "B+": ["B+", "AB+"],
    "B-": ["B+", "B-", "AB+", "AB-"],
    "AB+": ["AB+"],
    "AB-": ["AB+", "AB-"],
    "O+": ["A+", "B+", "AB+", "O+"],
    "O-": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
}

RARITY_ORDER = ["O-", "AB-", "A-", "B-", "AB+", "B+", "A+", "O+"]

def initialize_database():
    """Initialize database with collections and default data"""
    if database is None:
        return
    
    blood_types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    
    # Check if inventory exists, if not create it
    inventory_count = database.inventory.count_documents({})
    if inventory_count == 0:
        inventory_docs = []
        for blood_type in blood_types:
            inventory_docs.append({
                "blood_type": blood_type,
                "units_available": 10 if blood_type in ["A+", "O+"] else 5,
                "units_reserved": 0,
                "low_stock_threshold": 5,
                "last_updated": datetime.utcnow()
            })
        database.inventory.insert_many(inventory_docs)
        print("Initialized inventory with default stock levels")

    # Create indexes
    try:
        database.donors.create_index("donor_id", unique=True)
        database.inventory.create_index("blood_type", unique=True)
    except:
        pass  # Indexes might already exist

# Initialize database on startup
initialize_database()

@app.route('/')
def root():
    return {"message": "BECS Backend API is running", "database": "connected" if database is not None else "disconnected"}

@app.route('/health')
def health_check():
    try:
        if database is not None:
            database.command("ping")
            return {"status": "healthy", "service": "becs-backend", "database": "connected"}
        else:
            return {"status": "unhealthy", "service": "becs-backend", "database": "disconnected"}
    except Exception as e:
        return {"status": "unhealthy", "service": "becs-backend", "database": "disconnected", "error": str(e)}

@app.route('/api/inventory')
def get_inventory():
    """Get current blood inventory"""
    try:
        if database is None:
            return jsonify({"error": "Database not connected"}), 500
        
        inventory = list(database.inventory.find({}, {"_id": 0}))
        return jsonify(inventory)
    except Exception as e:
        return jsonify({"error": f"Failed to fetch inventory: {str(e)}"}), 500

@app.route('/api/donations', methods=['POST'])
def record_donation():
    """Record a blood donation"""
    try:
        if database is None:
            return jsonify({"error": "Database not connected"}), 500
        
        data = request.get_json()
        donor_id = data.get('donor_id')
        full_name = data.get('full_name')
        blood_type = data.get('blood_type')
        donation_date = data.get('donation_date', datetime.utcnow().isoformat())
        units_collected = data.get('units_collected', 1)
        
        if not all([donor_id, full_name, blood_type]):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Check if donor exists, if not create
        existing_donor = database.donors.find_one({"donor_id": donor_id})
        if not existing_donor:
            donor_doc = {
                "donor_id": donor_id,
                "full_name": full_name,
                "blood_type": blood_type,
                "created_at": datetime.utcnow(),
                "last_donation": datetime.fromisoformat(donation_date.replace('Z', '+00:00'))
            }
            database.donors.insert_one(donor_doc)
        else:
            database.donors.update_one(
                {"donor_id": donor_id},
                {"$set": {"last_donation": datetime.fromisoformat(donation_date.replace('Z', '+00:00'))}}
            )
        
        # Record the donation
        donation_doc = {
            "donor_id": donor_id,
            "donation_date": datetime.fromisoformat(donation_date.replace('Z', '+00:00')),
            "blood_type": blood_type,
            "units_collected": units_collected,
            "created_at": datetime.utcnow()
        }
        database.donations.insert_one(donation_doc)
        
        # Update inventory
        database.inventory.update_one(
            {"blood_type": blood_type},
            {
                "$inc": {"units_available": units_collected},
                "$set": {"last_updated": datetime.utcnow()}
            }
        )
        
        # Log transaction
        transaction_doc = {
            "transaction_type": "donation",
            "blood_type": blood_type,
            "units": units_collected,
            "timestamp": datetime.utcnow(),
            "notes": f"Donation from {full_name}"
        }
        database.transactions.insert_one(transaction_doc)
        
        return jsonify({"success": True, "message": "Donation recorded successfully!"})
        
    except Exception as e:
        return jsonify({"error": f"Failed to record donation: {str(e)}"}), 500

@app.route('/api/distribute/routine', methods=['POST'])
def routine_distribution():
    """Handle routine blood distribution request"""
    try:
        if database is None:
            return jsonify({"error": "Database not connected"}), 500
        
        data = request.get_json()
        blood_type = data.get('blood_type')
        units = data.get('units')
        
        if not blood_type or not units:
            return jsonify({"error": "Missing blood_type or units"}), 400
        
        inventory_item = database.inventory.find_one({"blood_type": blood_type})
        if not inventory_item:
            return jsonify({"error": "Invalid blood type"}), 400
        
        if inventory_item["units_available"] >= units:
            database.inventory.update_one(
                {"blood_type": blood_type},
                {
                    "$inc": {"units_available": -units},
                    "$set": {"last_updated": datetime.utcnow()}
                }
            )
            
            transaction_doc = {
                "transaction_type": "routine_distribution",
                "blood_type": blood_type,
                "units": units,
                "timestamp": datetime.utcnow(),
                "notes": "Routine distribution"
            }
            database.transactions.insert_one(transaction_doc)
            
            return jsonify({
                "success": True,
                "message": f"Successfully distributed {units} units of {blood_type}",
                "units_provided": units
            })
        else:
            alternatives = get_compatible_alternatives(blood_type)
            return jsonify({
                "success": False,
                "message": f"Insufficient stock. Only {inventory_item['units_available']} units available.",
                "alternatives": alternatives
            })
            
    except Exception as e:
        return jsonify({"error": f"Failed to process distribution: {str(e)}"}), 500

@app.route('/api/distribute/emergency', methods=['POST'])
def emergency_distribution():
    """Handle emergency blood distribution (O- only)"""
    try:
        if database is None:
            return jsonify({"error": "Database not connected"}), 500
        
        o_negative = database.inventory.find_one({"blood_type": "O-"})
        if not o_negative or o_negative["units_available"] == 0:
            return jsonify({
                "success": False,
                "message": "No O- blood available for emergency distribution!"
            })
        
        units_to_dispense = o_negative["units_available"]
        
        database.inventory.update_one(
            {"blood_type": "O-"},
            {
                "$set": {
                    "units_available": 0,
                    "last_updated": datetime.utcnow()
                }
            }
        )
        
        transaction_doc = {
            "transaction_type": "emergency_distribution",
            "blood_type": "O-",
            "units": units_to_dispense,
            "timestamp": datetime.utcnow(),
            "notes": "Emergency distribution - all available units"
        }
        database.transactions.insert_one(transaction_doc)
        
        return jsonify({
            "success": True,
            "message": f"Emergency distribution: {units_to_dispense} units of O- blood dispensed",
            "units_provided": units_to_dispense
        })
        
    except Exception as e:
        return jsonify({"error": f"Failed to process emergency distribution: {str(e)}"}), 500

@app.route('/api/transactions')
def get_recent_transactions():
    """Get recent transactions"""
    try:
        if database is None:
            return jsonify({"error": "Database not connected"}), 500
        
        transactions = list(database.transactions.find(
            {}, {"_id": 0}
        ).sort("timestamp", -1).limit(10))
        
        # Convert datetime objects to strings for JSON serialization
        for transaction in transactions:
            if 'timestamp' in transaction:
                transaction['timestamp'] = transaction['timestamp'].isoformat()
        
        return jsonify(transactions)
    except Exception as e:
        return jsonify({"error": f"Failed to fetch transactions: {str(e)}"}), 500

def get_compatible_alternatives(requested_type):
    """Get compatible blood type alternatives"""
    if database is None:
        return []
    
    alternatives = []
    
    for donor_type, can_donate_to in COMPATIBILITY_MATRIX.items():
        if requested_type in can_donate_to:
            inventory = database.inventory.find_one({"blood_type": donor_type})
            if inventory and inventory["units_available"] > 0:
                alternatives.append({
                    "blood_type": donor_type,
                    "available": inventory["units_available"]
                })
    
    alternatives.sort(key=lambda x: RARITY_ORDER.index(x["blood_type"]))
    return alternatives

if __name__ == "__main__":
    print("🩸 Starting BECS Backend...")
    print(f"📊 Database: {database_name}")
    print(f"🔗 MongoDB URI: {mongodb_url}")
    print("🚀 Starting Flask server...")
    print("📍 API will be available at: http://localhost:8000")
    print("🛑 Press Ctrl+C to stop the server")
    app.run(host="0.0.0.0", port=8000, debug=True)