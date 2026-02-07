import json
import time
import requests

from config import PINATA_API_KEY, PINATA_SECRET_KEY


PINATA_PIN_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"

MAX_RETRIES = 3
TIMEOUT = 60


# Reusable session (better performance)
_session = requests.Session()


def _get_headers():
    if not PINATA_API_KEY or not PINATA_SECRET_KEY:
        raise RuntimeError("Pinata API keys are missing")

    return {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_SECRET_KEY
    }


def upload_to_ipfs(
    file_path: str,
    metadata: dict | None = None
) -> str:
    """
    Upload file to Pinata IPFS and return CID

    Args:
        file_path: Path to encrypted file
        metadata: Optional metadata dict
    """

    headers = _get_headers()

    pinata_options = {
        "cidVersion": 1
    }

    pinata_metadata = {
        "name": file_path.split("/")[-1]
    }

    if metadata:
        pinata_metadata["keyvalues"] = metadata

    payload = {
        "pinataOptions": json.dumps(pinata_options),
        "pinataMetadata": json.dumps(pinata_metadata)
    }

    for attempt in range(1, MAX_RETRIES + 1):

        try:
            with open(file_path, "rb") as f:

                files = {
                    "file": f
                }

                response = _session.post(
                    PINATA_PIN_FILE_URL,
                    headers=headers,
                    files=files,
                    data=payload,
                    timeout=TIMEOUT
                )

            if response.status_code == 200:
                data = response.json()
                return data["IpfsHash"]

            # Retry on server errors
            if response.status_code >= 500:
                raise RuntimeError(
                    f"Pinata server error: {response.status_code}"
                )

            # Client error (don't retry)
            raise RuntimeError(
                f"Pinata error {response.status_code}: {response.text}"
            )

        except requests.exceptions.RequestException as e:

            if attempt == MAX_RETRIES:
                raise RuntimeError(
                    f"IPFS upload failed after {MAX_RETRIES} tries: {str(e)}"
                )

            # Wait before retry
            time.sleep(2 * attempt)


    raise RuntimeError("Unexpected upload failure")
