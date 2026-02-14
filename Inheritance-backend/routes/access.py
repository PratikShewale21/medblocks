from fastapi import APIRouter, HTTPException
from web3 import Web3
import json
import os
import threading

from services.blockchain import (
    grant_access,
    grant_temporary_access,
    revoke_access,
    check_access,
    grant_with_signature,
    revoke_with_signature
)

router = APIRouter(prefix="/access", tags=["Access Control"])


# ===============================
# FILE PATH (ABSOLUTE - FIX)
# ===============================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DOCTORS_FILE = os.path.join(
    BASE_DIR,
    "..",
    "data",
    "doctors.json"
)


# ===============================
# FILE LOCK (THREAD SAFE)
# ===============================

file_lock = threading.Lock()


# ===============================
# HELPERS
# ===============================

def validate_address(addr: str):

    if not Web3.is_address(addr):
        raise HTTPException(400, "Invalid Ethereum address")


def load_doctors():

    # Ensure folder exists
    os.makedirs(os.path.dirname(DOCTORS_FILE), exist_ok=True)

    # Create file if missing
    if not os.path.exists(DOCTORS_FILE):

        with open(DOCTORS_FILE, "w") as f:
            json.dump([], f)

        return []

    try:
        with open(DOCTORS_FILE, "r") as f:
            data = json.load(f)

        if not isinstance(data, list):
            return []

        return data

    except Exception as e:
        print("Load doctors error:", e)
        return []


def save_doctors(doctors):

    os.makedirs(os.path.dirname(DOCTORS_FILE), exist_ok=True)

    with open(DOCTORS_FILE, "w") as f:
        json.dump(doctors, f, indent=2)


# ===============================
# READ APIs
# ===============================

@router.get("/doctors")
def get_doctors():

    return load_doctors()


@router.get("/check")
def check_access_api(patient: str, doctor: str):

    validate_address(patient)
    validate_address(doctor)

    allowed = check_access(patient, doctor)

    return {
        "patient": patient,
        "doctor": doctor,
        "hasAccess": allowed
    }


# ===============================
# ADD DOCTOR
# ===============================

@router.post("/add-doctor")
def add_doctor(data: dict):

    try:

        name = data.get("name")
        wallet = data.get("wallet")

        if not name or not wallet:
            raise HTTPException(400, "Name and wallet required")

        validate_address(wallet)

        with file_lock:

            doctors = load_doctors()

            # Check duplicate
            for d in doctors:
                if d["wallet"].lower() == wallet.lower():
                    return {
                        "status": "exists",
                        "message": "Doctor already exists"
                    }

            # Add new doctor
            doctors.append({
                "id": len(doctors) + 1,
                "name": name,
                "wallet": wallet
            })

            save_doctors(doctors)

        return {
            "status": "added",
            "message": "Doctor added successfully"
        }

    except Exception as e:
        raise HTTPException(500, str(e))


# ===============================
# NORMAL MODE (Backend Signs)
# ===============================

@router.post("/grant/permanent")
def grant_permanent(data: dict):

    patient = data.get("patient")
    doctor = data.get("doctor")

    validate_address(patient)
    validate_address(doctor)

    tx = grant_access(patient, doctor)

    return {"tx_hash": tx}


@router.post("/grant/temp")
def grant_temp(data: dict):

    patient = data.get("patient")
    doctor = data.get("doctor")
    duration = data.get("duration")

    validate_address(patient)
    validate_address(doctor)

    if not duration or duration <= 0:
        raise HTTPException(400, "Invalid duration")

    tx = grant_temporary_access(patient, doctor, duration)

    return {"tx_hash": tx}


@router.post("/revoke")
def revoke(data: dict):

    patient = data.get("patient")
    doctor = data.get("doctor")

    validate_address(patient)
    validate_address(doctor)

    tx = revoke_access(patient, doctor)

    return {"tx_hash": tx}


# ===============================
# GASLESS MODE (Meta TX)
# ===============================

@router.post("/gasless-grant")
def gasless_grant(data: dict):

    patient = data["patient"]
    doctor = data["doctor"]

    validate_address(patient)
    validate_address(doctor)

    tx = grant_with_signature(
        patient,
        doctor,
        True,
        0,
        data["nonce"],
        bytes.fromhex(data["signature"][2:])
    )

    return {"tx_hash": tx}


@router.post("/gasless-revoke")
def gasless_revoke(data: dict):

    patient = data["patient"]
    doctor = data["doctor"]

    validate_address(patient)
    validate_address(doctor)

    tx = revoke_with_signature(
        patient,
        doctor,
        data["nonce"],
        bytes.fromhex(data["signature"][2:])
    )

    return {"tx_hash": tx}
