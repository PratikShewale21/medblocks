from config import (
    RPC_URL,
    BACKEND_WALLET,
    MEDICAL_RECORDS_ADDRESS,
    ACCESS_CONTROL_ADDRESS,
    PINATA_API_KEY
)

print("=== Config Test ===\n")

print("RPC_URL:", RPC_URL)
print("Backend Wallet:", BACKEND_WALLET)
print("Medical Records Contract:", MEDICAL_RECORDS_ADDRESS)
print("Access Control Contract:", ACCESS_CONTROL_ADDRESS)
print("Pinata API Key Loaded:", bool(PINATA_API_KEY))

print("\n✅ Config loaded successfully")
