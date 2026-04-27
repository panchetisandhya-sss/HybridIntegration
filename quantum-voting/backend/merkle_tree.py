import hashlib

def sha256_hash(data: str) -> str:
    """Returns the SHA-256 hash of a string."""
    return hashlib.sha256(data.encode('utf-8')).hexdigest()

def compute_merkle_root(hash_list: list) -> str:
    """
    Computes the Merkle Root of a list of hashes.
    If the list has an odd number of hashes, the last hash is duplicated
    to pair up with itself, standard for Merkle trees.
    """
    if not hash_list:
        return sha256_hash("")
    if len(hash_list) == 1:
        return hash_list[0]
        
    new_level = []
    for i in range(0, len(hash_list), 2):
        left = hash_list[i]
        right = hash_list[i+1] if i + 1 < len(hash_list) else left
        combined = left + right
        new_level.append(sha256_hash(combined))
        
    return compute_merkle_root(new_level)
