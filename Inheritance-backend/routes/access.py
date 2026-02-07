from fastapi import APIRouter, Form, HTTPException
from web3 import Web3

from services.blockchain import (
    grant_access,              # permanent
    grant_temporary_access,    # temporary
    revoke_access              # revoke
)


router = APIRouter(prefix="/access", tags=["Access Control"])


# -------------------------------
# Grant Permanent Access
# -------------------------------

@router.post("/grant/permanent")
def grant_permanent_access(
    patient_address: str = Form(...),
    doctor_address: str = Form(...)
):

    if not Web3.is_address(patient_address) or not Web3.is_address(doctor_address):
        raise HTTPException(400, "Invalid Ethereum address")

    try:
        tx_hash = grant_access(patient_address, doctor_address)

        return {
            "status": "success",
            "message": "Permanent access granted",
            "transaction_hash": tx_hash
        }

    except Exception as e:
        raise HTTPException(500, str(e))


# -------------------------------
# Grant Temporary Access
# -------------------------------

@router.post("/grant/temp")
def grant_temp_access(
    patient_address: str = Form(...),
    doctor_address: str = Form(...),
    duration_seconds: int = Form(...)
):

    if not Web3.is_address(patient_address) or not Web3.is_address(doctor_address):
        raise HTTPException(400, "Invalid Ethereum address")

    if duration_seconds <= 0:
        raise HTTPException(400, "Duration must be > 0")

    try:
        tx_hash = grant_temporary_access(
            patient_address,
            doctor_address,
            duration_seconds
        )

        return {
            "status": "success",
            "message": "Temporary access granted",
            "transaction_hash": tx_hash,
            "valid_for_seconds": duration_seconds
        }

    except Exception as e:
        raise HTTPException(500, str(e))


# -------------------------------
# Revoke Access
# -------------------------------

@router.post("/revoke")
def revoke_access_api(
    patient_address: str = Form(...),
    doctor_address: str = Form(...)
):

    if not Web3.is_address(patient_address) or not Web3.is_address(doctor_address):
        raise HTTPException(400, "Invalid Ethereum address")

    try:
        tx_hash = revoke_access(
            patient_address,
            doctor_address
        )

        return {
            "status": "success",
            "message": "Access revoked",
            "transaction_hash": tx_hash
        }

    except Exception as e:
        raise HTTPException(500, str(e))
