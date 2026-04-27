import os

file_path = r'c:\Users\hp\Downloads\HybridIntegration-main\HybridIntegration-main\quantum-voting\backend\main.py'
with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Replace the corrupted strings
content = content.replace('"|00âŸ©"', '"|00⟩"')
content = content.replace('"|01âŸ©"', '"|01⟩"')
content = content.replace('"|10âŸ©"', '"|10⟩"')
content = content.replace('"|11âŸ©"', '"|11⟩"')
content = content.replace('"|Î¦+âŸ©"', '"|Φ+⟩"')
content = content.replace('"|00âŸ©"', '"|00⟩"') # Dupe check

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Encoding fixed in main.py")
