import os
from dotenv import load_dotenv
from web3 import Web3


# Load environment variables
load_dotenv()


# -------------------------------
# Network
# -------------------------------

NETWORK = os.getenv("NETWORK", "sepolia")


# -------------------------------
# Blockchain
# -------------------------------

RPC_URL = os.getenv("RPC_URL")

BACKEND_PRIVATE_KEY = os.getenv("BACKEND_PRIVATE_KEY")
BACKEND_WALLET = os.getenv("BACKEND_WALLET")

MEDICAL_RECORDS_ADDRESS = os.getenv("MEDICAL_RECORDS_ADDRESS")
ACCESS_CONTROL_ADDRESS = os.getenv("ACCESS_CONTROL_ADDRESS")


# -------------------------------
# Pinata
# -------------------------------

PINATA_API_KEY = os.getenv("PINATA_API_KEY")
PINATA_SECRET_KEY = os.getenv("PINATA_SECRET_KEY")


# -------------------------------
# Validation
# -------------------------------

def _require(name: str, value: str):
    if not value:
        raise RuntimeError(f"{name} is missing in .env file")


def _validate_eth_address(name: str, address: str):
    if not Web3.is_address(address):
        raise RuntimeError(f"{name} is not a valid Ethereum address")


# Required values
_require("RPC_URL", RPC_URL)
_require("BACKEND_PRIVATE_KEY", BACKEND_PRIVATE_KEY)
_require("BACKEND_WALLET", BACKEND_WALLET)
_require("MEDICAL_RECORDS_ADDRESS", MEDICAL_RECORDS_ADDRESS)
_require("ACCESS_CONTROL_ADDRESS", ACCESS_CONTROL_ADDRESS)
_require("PINATA_API_KEY", PINATA_API_KEY)
_require("PINATA_SECRET_KEY", PINATA_SECRET_KEY)


# Address format check
_validate_eth_address("BACKEND_WALLET", BACKEND_WALLET)
_validate_eth_address("MEDICAL_RECORDS_ADDRESS", MEDICAL_RECORDS_ADDRESS)
_validate_eth_address("ACCESS_CONTROL_ADDRESS", ACCESS_CONTROL_ADDRESS)
