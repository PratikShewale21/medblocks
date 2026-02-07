import os
from services.pinata_service import upload_to_ipfs


TEST_FILE = "test_upload.txt"


def main():

    try:
        print("=== Pinata IPFS Test ===\n")

        # Check file
        if not os.path.exists(TEST_FILE):
            raise FileNotFoundError(f"{TEST_FILE} not found")

        # Upload
        cid = upload_to_ipfs(TEST_FILE)

        print("✅ Upload successful")
        print("CID:", cid)
        print("Gateway URL:")
        print(f"https://gateway.pinata.cloud/ipfs/{cid}")

    except Exception as e:
        print("\n❌ Upload failed:")
        print(str(e))


if __name__ == "__main__":
    main()
