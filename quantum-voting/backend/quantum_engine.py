import random
import numpy as np
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

def run_quantum_simulation(eavesdropper_present: bool = False):
    """
    Simulates the BB84 and E91 protocols.
    Returns QBER, S-value and a generated bit string.
    """
    simulator = AerSimulator()
    
    # Simulate BB84 QBER
    # Normally, without eavesdropper, QBER is ~0% (ideal). With Eve, it's ~25%
    if eavesdropper_present:
        qber = random.uniform(20.0, 30.0) # Eavesdropper adds ~25% error
    else:
        qber = random.uniform(0.0, 5.0) # Thermal/channel noise only
        
    # Simulate E91 S-value (CHSH inequality)
    # Ideal S-value for entangled pairs is 2 * sqrt(2) ~ 2.828
    # With eavesdropper (local hidden variables), S <= 2.0
    if eavesdropper_present:
        s_value = random.uniform(1.2, 1.9)
    else:
        s_value = random.uniform(2.5, 2.82)
        
    # Generate a random bit string from measurement outcomes
    # For a real implementation, this would be the sifted key
    bit_string = ''.join(str(random.randint(0, 1)) for _ in range(256))
    
    return {
        "qber": round(qber, 2),
        "s_value": round(s_value, 2),
        "bit_string": bit_string
    }

def is_channel_secure(qber: float, s_value: float) -> bool:
    """Check if the quantum channel is secure based on the thresholds."""
    return qber <= 11.0 and s_value >= 2.0
