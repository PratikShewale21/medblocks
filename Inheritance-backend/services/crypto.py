from cryptography.fernet import Fernet


def generate_key() -> bytes:
    """
    Generate a new symmetric encryption key
    """
    return Fernet.generate_key()


def encrypt_file(input_path: str, output_path: str, key: bytes):
    """
    Encrypt a file using Fernet (AES)
    """
    fernet = Fernet(key)

    with open(input_path, "rb") as f:
        data = f.read()

    encrypted_data = fernet.encrypt(data)

    with open(output_path, "wb") as f:
        f.write(encrypted_data)


def decrypt_file(input_path: str, output_path: str, key: bytes):
    """
    Decrypt a file using Fernet (AES)
    """
    fernet = Fernet(key)

    with open(input_path, "rb") as f:
        encrypted_data = f.read()

    decrypted_data = fernet.decrypt(encrypted_data)

    with open(output_path, "wb") as f:
        f.write(decrypted_data)
