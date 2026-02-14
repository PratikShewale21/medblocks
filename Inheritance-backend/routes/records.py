import os
import uuid
import requests
import tempfile

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from web3 import Web3

from dotenv import load_dotenv
from cryptography.fernet import Fernet

from services.pinata_service import upload_to_ipfs
from services.blockchain import add_record, get_all_records, has_access
from services.crypto import encrypt_file


# -----------------------------------
# Load Environment
# -----------------------------------

load_dotenv()

MASTER_KEY = os.getenv("MASTER_KEY")

if not MASTER_KEY:
    raise Exception("MASTER_KEY not found in .env file")

fernet = Fernet(MASTER_KEY.encode())


# -----------------------------------
# Router
# -----------------------------------

router = APIRouter(prefix="/records", tags=["Records"])


# -----------------------------------
# Temp Directory (Cross-platform safe)
# -----------------------------------

TEMP_DIR = os.path.join(tempfile.gettempdir(), "medblocks")
os.makedirs(TEMP_DIR, exist_ok=True)


# -----------------------------------
# Upload Record (GLOBAL ACCESS MODE)
# -----------------------------------

@router.post("/upload")
async def upload_record(
    file: UploadFile = File(...),
    patient_address: str = Form(...),
    record_type: str = Form(...)
):

    if not Web3.is_address(patient_address):
        raise HTTPException(400, "Invalid patient address")

    uid = str(uuid.uuid4())
    original_filename = file.filename

    temp_path = os.path.join(TEMP_DIR, uid)
    enc_path = temp_path + ".enc"

    try:
        # Save original file
        content = await file.read()

        with open(temp_path, "wb") as f:
            f.write(content)

        # Encrypt
        encrypt_file(temp_path, enc_path, MASTER_KEY.encode())

        # Upload encrypted file to IPFS
        cid = upload_to_ipfs(enc_path)

        # Store metadata on blockchain
        tx_hash = add_record(
            patient_address,
            cid,
            record_type,
            original_filename
        )

        return {
            "status": "success",
            "cid": cid,
            "transaction_hash": tx_hash,
            "filename": original_filename
        }

    except Exception as e:
        raise HTTPException(500, str(e))

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

        if os.path.exists(enc_path):
            os.remove(enc_path)


# -----------------------------------
# Fetch Records
# -----------------------------------

@router.get("/{patient_address}")
def fetch_records(patient_address: str, requester_address: str):

    if not Web3.is_address(patient_address):
        raise HTTPException(400, "Invalid patient address")

    if not Web3.is_address(requester_address):
        raise HTTPException(400, "Invalid requester address")

    # ✅ Allow patient himself
    if patient_address.lower() != requester_address.lower():
        if not has_access(patient_address, requester_address):
            raise HTTPException(403, "Access denied")

    records = get_all_records(patient_address)

    return {
        "patient": patient_address,
        "records": records
    }


# -----------------------------------
# View & Decrypt Record
# -----------------------------------

@router.get("/view/{cid}")
def view_record(
    cid: str,
    patient_address: str,
    requester_address: str
):

    if not Web3.is_address(patient_address):
        raise HTTPException(400, "Invalid patient address")

    if not Web3.is_address(requester_address):
        raise HTTPException(400, "Invalid requester address")

    # ✅ Allow patient himself
    if patient_address.lower() != requester_address.lower():
        if not has_access(patient_address, requester_address):
            raise HTTPException(403, "Access denied")

    # Download encrypted file from IPFS
    url = f"https://gateway.pinata.cloud/ipfs/{cid}"
    res = requests.get(url, timeout=20)

    if res.status_code != 200 or not res.content:
        raise HTTPException(404, "File not found on IPFS")

    try:
        decrypted = fernet.decrypt(res.content)
    except Exception:
        raise HTTPException(500, "Decryption failed")

    # Save decrypted temp file
    dec_path = os.path.join(TEMP_DIR, f"{cid}.out")

    with open(dec_path, "wb") as f:
        f.write(decrypted)

    # Get original filename
    records = get_all_records(patient_address)

    filename = "medical_record"

    for r in records:
        if r["cid"] == cid:
            filename = r.get("filename") or "medical_record"
            break

    return FileResponse(
        path=dec_path,
        filename=filename,
        media_type="application/octet-stream"
    )
