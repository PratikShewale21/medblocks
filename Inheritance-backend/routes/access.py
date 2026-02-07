from fastapi import APIRouter, HTTPException
from web3 import Web3

from services.blockchain import grant_access


router = APIRouter(prefix="/access", tags=["Access Control"])


# -------------------------------
# Grant Permanent Access
# -------------------------------

@router.post("/grant/permanent")
def grant_doctor_access(patient_address: str, doctor_address: str):

    # Validate addresses
    if not Web3.is_address(patient_address) or not Web3.is_address(doctor_address):
        raise HTTPException(status_code=400, detail="Invalid Ethereum address")

    try:
        tx_hash = grant_access(patient_address, doctor_address)

        return {
            "status": "success",
            "message": "Permanent access granted",
            "transaction_hash": tx_hash
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------
# Revoke Access (Optional)
# -------------------------------

@router.post("/revoke")
def revoke_doctor_access(patient_address: str, doctor_address: str):

    # Not implemented in blockchain.py yet
    raise HTTPException(
        status_code=501,
        detail="Revoke access not implemented yet"
    )
