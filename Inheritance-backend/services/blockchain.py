from web3 import Web3
import json
import os

from config import (
    RPC_URL,
    MEDICAL_RECORDS_ADDRESS,
    ACCESS_CONTROL_ADDRESS,
    BACKEND_PRIVATE_KEY,
    BACKEND_WALLET
)


# -------------------------------
# Web3 Connection
# -------------------------------

w3 = Web3(Web3.HTTPProvider(RPC_URL))

if not w3.is_connected():
    raise RuntimeError("❌ Failed to connect to RPC")

print("✅ Connected to blockchain")


# -------------------------------
# Load ABIs
# -------------------------------

with open("contracts/MedicalRecords.json") as f:
    medical_records_abi = json.load(f)["abi"]

with open("contracts/AccessControl.json") as f:
    access_control_abi = json.load(f)["abi"]


# -------------------------------
# Contract Instances
# -------------------------------

medical_records_contract = w3.eth.contract(
    address=Web3.to_checksum_address(MEDICAL_RECORDS_ADDRESS),
    abi=medical_records_abi
)

access_control_contract = w3.eth.contract(
    address=Web3.to_checksum_address(ACCESS_CONTROL_ADDRESS),
    abi=access_control_abi
)


# -------------------------------
# Filename Mapping (Local Storage)
# -------------------------------

FILE_MAP = "file_map.json"


def load_file_map():

    if not os.path.exists(FILE_MAP):
        return {}

    with open(FILE_MAP, "r") as f:
        return json.load(f)


def save_file_map(data):

    with open(FILE_MAP, "w") as f:
        json.dump(data, f, indent=2)


def save_filename(cid: str, filename: str):

    data = load_file_map()
    data[cid] = filename
    save_file_map(data)


def get_filename(cid: str):

    data = load_file_map()
    return data.get(cid)


# -------------------------------
# Read Functions
# -------------------------------

def has_access(patient_address: str, doctor_address: str) -> bool:

    if not Web3.is_address(patient_address) or not Web3.is_address(doctor_address):
        raise ValueError("Invalid Ethereum address")

    return access_control_contract.functions.hasAccess(
        Web3.to_checksum_address(patient_address),
        Web3.to_checksum_address(doctor_address)
    ).call()


def get_all_records(patient_address: str):

    if not Web3.is_address(patient_address):
        raise ValueError("Invalid Ethereum address")

    records = medical_records_contract.functions.getAllRecords(
        Web3.to_checksum_address(patient_address)
    ).call()

    result = []

    for r in records:

        cid = r[0]

        result.append({
            "cid": cid,
            "record_type": r[1],
            "timestamp": r[2],
            "added_by": r[3],
            "filename": get_filename(cid),   # <-- added
            "ipfs_url": f"https://gateway.pinata.cloud/ipfs/{cid}"
        })

    return result


# -------------------------------
# Write Functions
# -------------------------------

def grant_access(patient_address: str, doctor_address: str) -> str:

    if not Web3.is_address(patient_address) or not Web3.is_address(doctor_address):
        raise ValueError("Invalid Ethereum address")

    nonce = w3.eth.get_transaction_count(BACKEND_WALLET, "pending")

    tx = access_control_contract.functions.grantPermanentAccess(
        Web3.to_checksum_address(doctor_address)
    ).build_transaction({
        "from": BACKEND_WALLET,
        "nonce": nonce,
        "gas": 200000,
        "maxFeePerGas": w3.to_wei("30", "gwei"),
        "maxPriorityFeePerGas": w3.to_wei("2", "gwei"),
    })

    signed_tx = w3.eth.account.sign_transaction(tx, BACKEND_PRIVATE_KEY)

    tx_hash = w3.eth.send_raw_transaction(
        signed_tx.raw_transaction
    )

    return tx_hash.hex()


def add_record(
    patient_address: str,
    cid: str,
    record_type: str,
    filename: str
) -> str:

    if not Web3.is_address(patient_address):
        raise ValueError("Invalid Ethereum address")

    nonce = w3.eth.get_transaction_count(BACKEND_WALLET, "pending")

    tx = medical_records_contract.functions.addRecord(
        Web3.to_checksum_address(patient_address),
        cid,
        record_type
    ).build_transaction({
        "from": BACKEND_WALLET,
        "nonce": nonce,
        "gas": 300000,
        "maxFeePerGas": w3.to_wei("30", "gwei"),
        "maxPriorityFeePerGas": w3.to_wei("2", "gwei"),
    })

    signed_tx = w3.eth.account.sign_transaction(tx, BACKEND_PRIVATE_KEY)

    tx_hash = w3.eth.send_raw_transaction(
        signed_tx.raw_transaction
    )

    # Save filename locally
    save_filename(cid, filename)

    return tx_hash.hex()
