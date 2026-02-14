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

# ===============================
# WEB3 CONNECTION
# ===============================

w3 = Web3(Web3.HTTPProvider(RPC_URL))

if not w3.is_connected():
    raise RuntimeError("❌ RPC connection failed")

BACKEND_WALLET = Web3.to_checksum_address(BACKEND_WALLET)

print("✅ Connected to blockchain")


# ===============================
# LOAD ABIS
# ===============================

with open("contracts/MedicalRecords.json") as f:
    medical_records_abi = json.load(f)["abi"]

with open("contracts/AccessControl.json") as f:
    access_control_abi = json.load(f)["abi"]


# ===============================
# CONTRACTS
# ===============================

medical_records_contract = w3.eth.contract(
    address=Web3.to_checksum_address(MEDICAL_RECORDS_ADDRESS),
    abi=medical_records_abi
)

access_control_contract = w3.eth.contract(
    address=Web3.to_checksum_address(ACCESS_CONTROL_ADDRESS),
    abi=access_control_abi
)


# ===============================
# LOCAL FILE MAP
# ===============================

FILE_MAP = "file_map.json"


def load_file_map():

    if not os.path.exists(FILE_MAP):
        return {}

    with open(FILE_MAP, "r") as f:
        return json.load(f)


def save_file_map(data):

    with open(FILE_MAP, "w") as f:
        json.dump(data, f, indent=2)


def save_filename(cid, filename):

    data = load_file_map()
    data[cid] = filename
    save_file_map(data)


def get_filename(cid):

    return load_file_map().get(cid)


# ===============================
# READ FUNCTIONS
# ===============================

def check_access(patient, doctor):

    if not Web3.is_address(patient) or not Web3.is_address(doctor):
        raise ValueError("Invalid address")

    return access_control_contract.functions.hasAccess(
        Web3.to_checksum_address(patient),
        Web3.to_checksum_address(doctor)
    ).call()


def get_all_records(patient):

    if not Web3.is_address(patient):
        raise ValueError("Invalid address")

    records = medical_records_contract.functions.getAllRecords(
        Web3.to_checksum_address(patient)
    ).call()

    result = []

    for r in records:

        cid = r[0]

        result.append({
            "cid": cid,
            "record_type": r[1],
            "timestamp": r[2],
            "added_by": r[3],
            "filename": get_filename(cid),
            "ipfs_url": f"https://gateway.pinata.cloud/ipfs/{cid}"
        })

    return result


# ===============================
# TRANSACTION HELPER
# ===============================

def _send_tx(tx):

    signed = w3.eth.account.sign_transaction(
        tx,
        BACKEND_PRIVATE_KEY
    )

    tx_hash = w3.eth.send_raw_transaction(
        signed.raw_transaction
    )

    return "0x" + tx_hash.hex()


def _build_tx(function, gas=300000):

    nonce = w3.eth.get_transaction_count(
        BACKEND_WALLET,
        "pending"
    )

    return function.build_transaction({
        "from": BACKEND_WALLET,
        "nonce": nonce,
        "gas": gas,
        "maxFeePerGas": w3.to_wei("30", "gwei"),
        "maxPriorityFeePerGas": w3.to_wei("2", "gwei"),
    })


# ===============================
# NORMAL MODE (Backend signs)
# ===============================

def add_record(patient, cid, record_type, filename):

    if not Web3.is_address(patient):
        raise ValueError("Invalid patient")

    tx = _build_tx(
        medical_records_contract.functions.addRecord(
            Web3.to_checksum_address(patient),
            cid,
            record_type
        )
    )

    tx_hash = _send_tx(tx)

    save_filename(cid, filename)

    return tx_hash


def grant_access(patient, doctor):

    tx = _build_tx(
        access_control_contract.functions.grantPermanentAccess(
            Web3.to_checksum_address(doctor)
        ),
        gas=200000
    )

    return _send_tx(tx)


def grant_temporary_access(patient, doctor, duration):

    tx = _build_tx(
        access_control_contract.functions.grantTemporaryAccess(
            Web3.to_checksum_address(doctor),
            duration
        ),
        gas=200000
    )

    return _send_tx(tx)


def revoke_access(patient, doctor):

    tx = _build_tx(
        access_control_contract.functions.revokeAccess(
            Web3.to_checksum_address(doctor)
        ),
        gas=200000
    )

    return _send_tx(tx)


# ===============================
# GASLESS MODE (Signature)
# ===============================

def grant_with_signature(
    patient,
    doctor,
    permanent,
    expiry,
    nonce,
    signature
):

    tx = _build_tx(
        access_control_contract.functions.grantWithSignature(
            Web3.to_checksum_address(patient),
            Web3.to_checksum_address(doctor),
            permanent,
            expiry,
            nonce,
            signature
        )
    )

    return _send_tx(tx)


def revoke_with_signature(
    patient,
    doctor,
    nonce,
    signature
):

    tx = _build_tx(
        access_control_contract.functions.revokeWithSignature(
            Web3.to_checksum_address(patient),
            Web3.to_checksum_address(doctor),
            nonce,
            signature
        )
    )

    return _send_tx(tx)


# ===============================
# BACKWARD COMPATIBILITY
# ===============================

def has_access(patient, doctor):
    return check_access(patient, doctor)
