from web3 import Web3
from fastapi import HTTPException


def validate_eth_address(address: str, field_name: str = "address"):
    """
    Validate Ethereum address
    """

    if not Web3.is_address(address):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {field_name}: {address}"
        )

    return Web3.to_checksum_address(address)


def validate_ipfs_cid(cid: str):
    """
    Basic IPFS CID validation
    """

    if not cid or len(cid) < 40:
        raise HTTPException(
            status_code=400,
            detail="Invalid IPFS CID"
        )

    return cid


def validate_file_size(size: int, max_mb: int = 10):
    """
    Limit upload size
    """

    max_bytes = max_mb * 1024 * 1024

    if size > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large (max {max_mb}MB)"
        )
