import os
from Crypto.Cipher import AES
import base64
import hashlib

def generate_aes_key(quantum_bit_string: str) -> bytes:
    """Generate a 256-bit AES key from the quantum bit string using SHA-256."""
    return hashlib.sha256(quantum_bit_string.encode()).digest()

def encrypt_vote(vote: str, aes_key: bytes) -> str:
    """Encrypt the vote using AES-GCM."""
    cipher = AES.new(aes_key, AES.MODE_GCM)
    ciphertext, tag = cipher.encrypt_and_digest(vote.encode('utf-8'))
    
    # Return nonce, tag, and ciphertext encoded in base64
    return base64.b64encode(cipher.nonce + tag + ciphertext).decode('utf-8')

def decrypt_vote(encrypted_vote: str, aes_key: bytes) -> str:
    """Decrypt the vote using AES-GCM."""
    data = base64.b64decode(encrypted_vote.encode('utf-8'))
    nonce, tag, ciphertext = data[:16], data[16:32], data[32:]
    
    cipher = AES.new(aes_key, AES.MODE_GCM, nonce=nonce)
    return cipher.decrypt_and_verify(ciphertext, tag).decode('utf-8')
