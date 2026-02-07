import os

from services.crypto import generate_key, encrypt_file, decrypt_file


INPUT_FILE = "test_upload.txt"
ENC_FILE = "encrypted.enc"
DEC_FILE = "decrypted.txt"


def main():

    try:
        print("=== Crypto Test ===\n")

        if not os.path.exists(INPUT_FILE):
            with open(INPUT_FILE, "w") as f:
                f.write("Test medical record content 2.0")


        # Read original content
        with open(INPUT_FILE, "rb") as f:
            original = f.read()

        # Generate key
        key = generate_key()

        # Encrypt
        encrypt_file(INPUT_FILE, ENC_FILE, key)

        # Decrypt
        decrypt_file(ENC_FILE, DEC_FILE, key)

        # Verify
        with open(DEC_FILE, "rb") as f:
            decrypted = f.read()

        if original != decrypted:
            raise ValueError("Decrypted file does not match original")

        print("✅ Encryption and Decryption successful")

    except Exception as e:
        print("❌ Crypto test failed:")
        print(str(e))

    finally:
        # Cleanup
        if os.path.exists(ENC_FILE):
            os.remove(ENC_FILE)

        if os.path.exists(DEC_FILE):
            os.remove(DEC_FILE)


if __name__ == "__main__":
    main()
