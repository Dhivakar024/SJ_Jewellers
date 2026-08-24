"""
Production Security, Hardening & Final API Validation Test Suite
Uses standard Python unittest and FastAPI TestClient with isolated dependencies.
"""

import unittest
import sys
import os
from unittest.mock import MagicMock

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import get_database
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    get_current_user,
    require_admin,
)


class TestProductionSecurity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def tearDown(self):
        app.dependency_overrides.clear()

    def test_01_security_headers(self):
        """Verify OWASP security headers are present on API responses."""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        headers = response.headers
        self.assertEqual(headers.get("x-content-type-options"), "nosniff")
        self.assertEqual(headers.get("x-frame-options"), "DENY")
        self.assertIn("x-xss-protection", headers)
        self.assertIn("referrer-policy", headers)

    def test_02_health_check_safe_response(self):
        """Verify health endpoint does not expose credentials or database URI."""
        response = self.client.get("/health")
        data = response.json()
        self.assertIn("status", data)
        self.assertIn("service", data)
        raw_text = response.text.lower()
        self.assertNotIn("mongodb+srv", raw_text)
        self.assertNotIn("password", raw_text)
        self.assertNotIn("jwt_secret", raw_text)

    def test_03_password_hashing_argon2(self):
        """Verify password hashing uses secure Argon2 and verifies correctly."""
        plain = "SecureTestPassword123!"
        hashed = hash_password(plain)
        self.assertNotEqual(hashed, plain)
        self.assertIn("$argon2", hashed)
        self.assertTrue(verify_password(plain, hashed))
        self.assertFalse(verify_password("WrongPassword", hashed))

    def test_04_jwt_token_creation_and_expiration(self):
        """Verify JWT access tokens encode, sign, and decode securely."""
        payload = {"sub": "test_user_id_123", "role": "customer", "mobile": "9876543210"}
        token = create_access_token(payload)
        self.assertIsInstance(token, str)
        self.assertGreater(len(token), 20)

        decoded = decode_access_token(token)
        self.assertIsNotNone(decoded)
        self.assertEqual(decoded.get("sub"), "test_user_id_123")
        self.assertEqual(decoded.get("role"), "customer")
        self.assertIn("exp", decoded)

    def test_05_unauthenticated_request_rejected(self):
        """Verify protected endpoints return 401 Unauthorized without a valid token."""
        endpoints = [
            "/api/profile/me",
            "/api/kyc/me",
            "/api/holdings/me",
            "/api/withdrawals",
            "/api/transactions",
            "/api/notifications",
            "/api/admin/dashboard",
            "/api/admin/users",
            "/api/admin/rates",
        ]
        for ep in endpoints:
            resp = self.client.get(ep)
            self.assertEqual(resp.status_code, 401, f"Expected 401 for unauthenticated {ep}, got {resp.status_code}")

    def test_06_customer_cannot_access_admin_endpoints(self):
        """Verify customer role is strictly denied access (403 Forbidden) on Admin endpoints."""
        mock_customer = {
            "id": "67b96000e783457a4eb182a1",
            "role": "customer",
            "name": "Customer User",
            "mobile": "9876543210",
        }
        app.dependency_overrides[get_current_user] = lambda: mock_customer

        admin_endpoints = [
            "/api/admin/dashboard",
            "/api/admin/users",
            "/api/admin/kyc/pending",
            "/api/admin/rates",
            "/api/admin/purchases",
            "/api/admin/withdrawals",
            "/api/admin/transactions",
            "/api/admin/notifications",
        ]
        for ep in admin_endpoints:
            resp = self.client.get(ep)
            self.assertEqual(resp.status_code, 403, f"Expected 403 Forbidden for customer on {ep}, got {resp.status_code}")

    def test_07_rate_and_purchase_validation(self):
        """Verify purchase payload rejects negative, zero, or invalid quantities."""
        mock_customer = {"id": "67b96000e783457a4eb182a1", "role": "customer"}
        app.dependency_overrides[get_current_user] = lambda: mock_customer
        app.dependency_overrides[get_database] = lambda: MagicMock()

        # Negative quantity
        resp = self.client.post("/api/purchases", json={"metal": "gold", "quantity_grams": -1.5})
        self.assertEqual(resp.status_code, 422)

        # Zero quantity
        resp = self.client.post("/api/purchases", json={"metal": "gold", "quantity_grams": 0})
        self.assertEqual(resp.status_code, 422)

        # Invalid metal
        resp = self.client.post("/api/purchases", json={"metal": "platinum", "quantity_grams": 1.0})
        self.assertEqual(resp.status_code, 422)

    def test_08_withdrawal_validation_rejects_invalid_inputs(self):
        """Verify withdrawal payload rejects negative or invalid parameters."""
        mock_customer = {"id": "67b96000e783457a4eb182a1", "role": "customer"}
        app.dependency_overrides[get_current_user] = lambda: mock_customer
        app.dependency_overrides[get_database] = lambda: MagicMock()

        # Negative quantity
        resp = self.client.post("/api/withdrawals", json={"metal": "gold", "quantity_grams": -0.5})
        self.assertEqual(resp.status_code, 422)

        # Invalid metal
        resp = self.client.post("/api/withdrawals", json={"metal": "diamond", "quantity_grams": 1.0})
        self.assertEqual(resp.status_code, 422)

    def test_09_kyc_validation(self):
        """Verify KYC payload validates required fields, gender, and ID document types."""
        mock_customer = {"id": "67b96000e783457a4eb182a1", "role": "customer"}
        app.dependency_overrides[get_current_user] = lambda: mock_customer
        app.dependency_overrides[get_database] = lambda: MagicMock()

        # Invalid gender
        invalid_gender_payload = {
            "full_name": "Test User",
            "date_of_birth": "1990-01-01",
            "gender": "unknown_gender",
            "address": {
                "address_line": "123 Main St",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "pincode": "600001",
            },
            "id_type": "pan",
            "id_number": "ABCDE1234F",
        }
        resp = self.client.post("/api/kyc/submit", json=invalid_gender_payload)
        self.assertEqual(resp.status_code, 422)

    def test_10_send_otp_new_user(self):
        """Verify send OTP endpoint sends dev OTP for an un-registered mobile number."""
        mock_db = MagicMock()
        mock_db.users.find_one.return_value = None  # Not registered
        app.dependency_overrides[get_database] = lambda: mock_db

        resp = self.client.post("/api/auth/send-otp", json={"mobile": "9123456780", "purpose": "signup"})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data.get("otp_sent"))
        self.assertEqual(data.get("dev_otp"), "123456")

    def test_11_send_otp_existing_user_rejected(self):
        """Verify send OTP for signup rejects an already registered mobile number."""
        mock_db = MagicMock()
        mock_db.users.find_one.return_value = {"mobile": "9876543210", "role": "customer"}
        app.dependency_overrides[get_database] = lambda: mock_db

        resp = self.client.post("/api/auth/send-otp", json={"mobile": "9876543210", "purpose": "signup"})
        self.assertEqual(resp.status_code, 400)
        self.assertIn("already registered", resp.json().get("detail", ""))

    def test_12_verify_otp_creates_user_and_token(self):
        """Verify valid OTP creates new user account and returns JWT token with profile_completed: False."""
        mock_db = MagicMock()
        mock_db.users.find_one.return_value = None
        mock_db.users.insert_one.return_value = MagicMock(inserted_id="67b96000e783457a4eb182a1")
        app.dependency_overrides[get_database] = lambda: mock_db

        resp = self.client.post(
            "/api/auth/verify-otp",
            json={"mobile": "9123456780", "otp": "123456", "name": "Ravi Kumar", "purpose": "signup"}
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("access_token", data)
        self.assertEqual(data.get("user", {}).get("profile_completed"), False)

    def test_13_verify_otp_invalid_rejected(self):
        """Verify wrong OTP code is rejected with 400 Bad Request."""
        mock_db = MagicMock()
        mock_db.otps.find_one.return_value = None
        app.dependency_overrides[get_database] = lambda: mock_db

        resp = self.client.post(
            "/api/auth/verify-otp",
            json={"mobile": "9123456780", "otp": "999999", "name": "Ravi Kumar", "purpose": "signup"}
        )
        self.assertEqual(resp.status_code, 400)
    def test_14_direct_registration_creates_account_and_jwt_token(self):
        """Verify direct user registration hashes password, creates account, and returns JWT token."""
        mock_db = MagicMock()
        mock_db.users.find_one.return_value = None
        mock_db.users.insert_one.return_value = MagicMock(inserted_id="67b96000e783457a4eb182b2")
        app.dependency_overrides[get_database] = lambda: mock_db

        resp = self.client.post(
            "/api/auth/register",
            json={
                "name": "Karthik Raja",
                "mobile": "9845123456",
                "email": "karthik@example.com",
                "password": "StrongPassword123!",
            }
        )
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["name"], "Karthik Raja")
        self.assertEqual(data["user"]["profile_completed"], False)

    def test_15_duplicate_registration_rejected(self):
        """Verify registration rejects duplicate mobile numbers."""
        mock_db = MagicMock()
        mock_db.users.find_one.return_value = {"mobile": "9845123456", "role": "customer"}
        app.dependency_overrides[get_database] = lambda: mock_db

        resp = self.client.post(
            "/api/auth/register",
            json={
                "name": "Karthik Raja",
                "mobile": "9845123456",
                "email": "karthik@example.com",
                "password": "StrongPassword123!",
            }
        )
        self.assertEqual(resp.status_code, 400)
        self.assertIn("already registered", resp.json().get("detail", ""))


if __name__ == "__main__":
    unittest.main(verbosity=2)
