# SecureScan - Static Code & Malware Scanner

<grok-card data-id="954be0" data-type="image_card"  data-arg-size="LARGE" ></grok-card>



<grok-card data-id="74355f" data-type="image_card"  data-arg-size="LARGE" ></grok-card>


**SecureScan** is a powerful, open-source command-line tool designed for developers and security professionals. It combines **static source code analysis** focused on **OWASP Top 10 vulnerabilities** with **file/folder malware scanning** to help identify security risks early in the development lifecycle.

<grok-card data-id="86dc4e" data-type="image_card"  data-arg-size="LARGE" ></grok-card>



<grok-card data-id="0f4b77" data-type="image_card"  data-arg-size="LARGE" ></grok-card>


## Features

- **Static Code Analysis** targeted at OWASP Top 10 risks:
  - A01: Broken Access Control
  - A02: Cryptographic Failures
  - A03: Injection (SQLi, Command, etc.)
  - A05: Security Misconfiguration
  - A07: Identification and Authentication Failures
  - And more...
- Pattern-based detection using regular expressions and heuristics.
- Supports multiple languages: Python, JavaScript, PHP, Java, etc.
- **Malware & Suspicious File Scanning**:
  - Detects common web shells, backdoors, obfuscated code, and known malicious patterns.
  - Scans directories recursively for suspicious files (e.g., encoded payloads, dangerous functions).
- Lightweight and fast – no external dependencies required.
- JSON and human-readable output formats.
- Customizable rules and easy to extend.

<grok-card data-id="75dc09" data-type="image_card"  data-arg-size="LARGE" ></grok-card>



<grok-card data-id="de9daf" data-type="image_card"  data-arg-size="LARGE" ></grok-card>



<grok-card data-id="ea4164" data-type="image_card"  data-arg-size="LARGE" ></grok-card>

cd SecureScan
pip install -r requirements.txt  # if any
chmod +x securescan.py
