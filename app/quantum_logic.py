from qiskit import QuantumCircuit
from qiskit_aer import Aer
import numpy as np

# -------------------------------------------------
# 1. BB84 Simulation Logic
# -------------------------------------------------
def simulate_bb84(key_length=100, include_eve=False):
    """
    Simulates BB84 protocol and computes QBER
    """
    # Alice's bits and bases
    a_bits = np.random.randint(0, 2, key_length)
    a_bases = np.random.randint(0, 2, key_length)

    # Bob's bases
    b_bases = np.random.randint(0, 2, key_length)

    # Hybrid BB84 + E91
    # Create 2 * key_length qubits (pairs)
    qc = QuantumCircuit(2 * key_length, 2 * key_length)

    # Entanglement preparation (E91)
    for i in range(key_length):
        alice_qubit = 2 * i
        bob_qubit = 2 * i + 1
        qc.h(alice_qubit)       # Superposition
        qc.cx(alice_qubit, bob_qubit) # Entanglement

    # Eve Interception
    if include_eve:
        for i in range(key_length):
            if np.random.rand() < 0.3:
                eve_basis = np.random.randint(0, 2)
                alice_qubit = 2 * i
                if eve_basis == 1:
                    qc.h(alice_qubit)
                qc.measure(alice_qubit, alice_qubit)
                if eve_basis == 1:
                    qc.h(alice_qubit)

    # Alice and Bob Bases Application (BB84 style on E91 pairs)
    for i in range(key_length):
        alice_qubit = 2 * i
        bob_qubit = 2 * i + 1
        
        # Alice
        if a_bases[i] == 1:
            qc.h(alice_qubit)
        qc.measure(alice_qubit, alice_qubit)

        # Bob
        if b_bases[i] == 1:
            qc.h(bob_qubit)
        qc.measure(bob_qubit, bob_qubit)

    # Run circuit
    backend = Aer.get_backend("aer_simulator")
    job = backend.run(qc, shots=1)
    result = job.result()
    counts = result.get_counts()

    bitstring = list(counts.keys())[0]
    total_bits = np.array([int(bit) for bit in bitstring[::-1]])
    
    a_bits_measured = total_bits[0::2] # Alice's measured bits
    b_bits_measured = total_bits[1::2] # Bob's measured bits

    # Sifting
    sifted_a = []
    sifted_b = []

    for i in range(key_length):
        if a_bases[i] == b_bases[i]:
            sifted_a.append(a_bits_measured[i])
            sifted_b.append(b_bits_measured[i])

    sift_len = len(sifted_a)
    mismatches = np.sum(np.array(sifted_a) != np.array(sifted_b)) if sift_len > 0 else 0
    
    # Inject realistic hardware/channel noise (Dark counts, decoherence)
    # Even without Eve, real quantum channels have 1% - 3.5% natural error.
    if sift_len > 0 and not include_eve:
        natural_noise_rate = 0.01 + (np.random.rand() * 0.025)
        mismatches += int(sift_len * natural_noise_rate)

    qber = mismatches / sift_len if sift_len > 0 else 0

    # Generate qasm (handling different qiskit versions)
    try:
        qasm_str = qc.qasm()
    except Exception:
        from qiskit import qasm2
        qasm_str = qasm2.dumps(qc)

    qubits_data = []
    for i in range(min(key_length, 8)):
        qubits_data.append({
            "id": i,
            "basis": "×" if a_bases[i] == 1 else "+",
            "bit": int(a_bits[i]),
            "bobBasis": "×" if b_bases[i] == 1 else "+",
            "matched": bool(a_bases[i] == b_bases[i]),
            "eveInterfered": include_eve
        })

    log = {
        "sifted_length": sift_len,
        "mismatches": int(mismatches),
        "qber": round(qber, 4),
        "qubits": qubits_data,
        "qasm": qasm_str
    }

    return qber, log


# -------------------------------------------------
# 2. E91 / CHSH Simulation
# -------------------------------------------------
def simulate_chsh(noise_level=0.0):
    """
    Simulates CHSH inequality value
    """
    max_S = 2 * np.sqrt(2)
    classical_S = 2.0

    concurrence = max(0.0, 1.0 - noise_level)
    simulated_S = max_S * concurrence

    if simulated_S < classical_S:
        simulated_S = classical_S - np.random.rand() * 0.1

    log = {
        "concurrence": round(concurrence, 4),
        "chsh_s": round(simulated_S, 4),
        "noise_level": noise_level
    }

    return simulated_S, log


# -------------------------------------------------
# 3. Secure Voting Logic
# -------------------------------------------------
def cast_secure_vote(party_id, eve_enabled=False):
    QBER_THRESHOLD = 0.05
    CHSH_LIMIT = 2.0

    qber, bb84_log = simulate_bb84(include_eve=eve_enabled)

    noise_level = 0.2 if eve_enabled else 0.01
    chsh_s, e91_log = simulate_chsh(noise_level=noise_level)

    is_qber_secure = qber <= QBER_THRESHOLD
    is_chsh_secure = chsh_s > CHSH_LIMIT

    status = "SECURE" if (is_qber_secure and is_chsh_secure) else "REJECTED"

    final_log = {
        "vote_id": f"VOTE_HASH_{np.random.randint(1000,9999)}",
        "party_id": party_id,
        "status": status,
        "qber": bb84_log["qber"],
        "chsh_s": e91_log["chsh_s"],
        "security_check": {
            "qber_pass": is_qber_secure,
            "chsh_pass": is_chsh_secure
        },
        "details": {**bb84_log, **e91_log},
        "circuit_qasm": bb84_log.get("qasm", ""),
        "circuit_qubits": bb84_log.get("qubits", [])
    }

    return final_log


# -------------------------------------------------
# MAIN TEST
# -------------------------------------------------
if __name__ == "__main__":
    print("\n---- Secure Vote (No Eve) ----")
    print(cast_secure_vote("PARTY_A", eve_enabled=False))

    print("\n---- Attacked Vote (Eve Present) ----")
    print(cast_secure_vote("PARTY_B", eve_enabled=True))

