"""
XI XVI API Backend Tests - Iteration 2
Tests for: New features - Admin product editing, AI Ad generator, Try-on render endpoint
Plus all existing endpoints from iteration 1
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@xixvi.com"
ADMIN_PASSWORD = "admin123"
TEST_USER_EMAIL = f"TEST_user_{uuid.uuid4().hex[:8]}@test.com"
TEST_USER_PASSWORD = "testpass123"
TEST_USER_NAME = "Test User"


class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_check(self):
        """GET /api/ should return status ok"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"
        assert "message" in data
        print(f"✓ Health check passed: {data}")


class TestAuthRegister:
    """User registration tests"""
    
    def test_register_new_user(self):
        """POST /api/auth/register creates new user"""
        session = requests.Session()
        payload = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "name": TEST_USER_NAME
        }
        response = session.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200, f"Register failed: {response.text}"
        data = response.json()
        assert data.get("email") == TEST_USER_EMAIL.lower()
        assert data.get("name") == TEST_USER_NAME
        assert data.get("role") == "customer"
        assert "id" in data
        print(f"✓ User registered: {data['email']}")
        return data
    
    def test_register_duplicate_email(self):
        """POST /api/auth/register with existing email returns 400"""
        email = f"TEST_dup_{uuid.uuid4().hex[:8]}@test.com"
        session = requests.Session()
        payload = {"email": email, "password": "test123", "name": "Dup Test"}
        response = session.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200
        
        response2 = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response2.status_code == 400
        assert "already registered" in response2.json().get("detail", "").lower()
        print("✓ Duplicate email rejected correctly")


class TestAuthLogin:
    """User login tests"""
    
    def test_login_admin(self):
        """POST /api/auth/login with admin credentials"""
        session = requests.Session()
        payload = {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        response = session.post(f"{BASE_URL}/api/auth/login", json=payload)
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert data.get("email") == ADMIN_EMAIL
        assert data.get("role") == "admin"
        assert "id" in data
        print(f"✓ Admin login successful: {data['email']}, role={data['role']}")
        return session
    
    def test_login_invalid_credentials(self):
        """POST /api/auth/login with wrong password returns 401"""
        payload = {"email": ADMIN_EMAIL, "password": "wrongpassword"}
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        assert response.status_code == 401
        assert "invalid" in response.json().get("detail", "").lower()
        print("✓ Invalid credentials rejected correctly")
    
    def test_login_nonexistent_user(self):
        """POST /api/auth/login with non-existent email returns 401"""
        payload = {"email": "nonexistent@test.com", "password": "anypass"}
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        assert response.status_code == 401
        print("✓ Non-existent user rejected correctly")


class TestAuthMe:
    """Current user endpoint tests"""
    
    def test_me_authenticated(self):
        """GET /api/auth/me returns current user when authenticated"""
        session = requests.Session()
        login_resp = session.post(f"{BASE_URL}/api/auth/login", 
                                   json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert login_resp.status_code == 200
        
        response = session.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data.get("email") == ADMIN_EMAIL
        assert "password_hash" not in data
        print(f"✓ /auth/me returned user: {data['email']}")
    
    def test_me_unauthenticated(self):
        """GET /api/auth/me returns 401 when not authenticated"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ /auth/me correctly rejects unauthenticated request")


class TestAuthLogout:
    """Logout endpoint tests"""
    
    def test_logout(self):
        """POST /api/auth/logout clears session"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", 
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        
        response = session.post(f"{BASE_URL}/api/auth/logout")
        assert response.status_code == 200
        assert "logged out" in response.json().get("message", "").lower()
        
        me_resp = session.get(f"{BASE_URL}/api/auth/me")
        assert me_resp.status_code == 401
        print("✓ Logout successful, session cleared")


class TestProducts:
    """Product endpoints tests"""
    
    def test_get_products(self):
        """GET /api/products returns product list"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert "total" in data
        assert "page" in data
        assert "categories" in data
        assert isinstance(data["products"], list)
        print(f"✓ Products endpoint returned {data['total']} products")
    
    def test_get_products_with_category_filter(self):
        """GET /api/products?category=tops filters by category"""
        response = requests.get(f"{BASE_URL}/api/products", params={"category": "tops"})
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        for product in data["products"]:
            assert product.get("category") == "tops"
        print(f"✓ Category filter working, returned {len(data['products'])} tops")


class TestProfile:
    """Profile endpoints tests"""
    
    def test_update_address_authenticated(self):
        """PUT /api/profile/address saves shipping address"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", 
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        
        address_data = {
            "full_name": "Test Admin",
            "address_line1": "123 Test Street",
            "address_line2": "Suite 100",
            "city": "Test City",
            "state": "TS",
            "zip_code": "12345",
            "country": "US",
            "phone": "555-1234"
        }
        response = session.put(f"{BASE_URL}/api/profile/address", json=address_data)
        assert response.status_code == 200
        assert "updated" in response.json().get("message", "").lower()
        
        profile_resp = session.get(f"{BASE_URL}/api/profile")
        assert profile_resp.status_code == 200
        profile = profile_resp.json()
        assert profile.get("address", {}).get("full_name") == "Test Admin"
        assert profile.get("address", {}).get("city") == "Test City"
        print("✓ Address saved and verified")
    
    def test_update_address_unauthenticated(self):
        """PUT /api/profile/address returns 401 when not authenticated"""
        response = requests.put(f"{BASE_URL}/api/profile/address", json={"full_name": "Test"})
        assert response.status_code == 401
        print("✓ Address update correctly rejects unauthenticated request")


class TestAdminEndpoints:
    """Admin-only endpoints tests"""
    
    @pytest.fixture
    def admin_session(self):
        """Get authenticated admin session"""
        session = requests.Session()
        resp = session.post(f"{BASE_URL}/api/auth/login", 
                            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert resp.status_code == 200
        return session
    
    def test_admin_stats(self, admin_session):
        """GET /api/admin/stats returns dashboard stats"""
        response = admin_session.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_products" in data
        assert "total_orders" in data
        assert "pending_orders" in data
        assert isinstance(data["total_users"], int)
        print(f"✓ Admin stats: users={data['total_users']}, products={data['total_products']}, orders={data['total_orders']}")
    
    def test_admin_stats_unauthorized(self):
        """GET /api/admin/stats returns 401/403 for non-admin"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code in [401, 403]
        print("✓ Admin stats correctly rejects unauthenticated request")
    
    def test_admin_settings_get(self, admin_session):
        """GET /api/admin/settings returns settings list"""
        response = admin_session.get(f"{BASE_URL}/api/admin/settings")
        assert response.status_code == 200
        data = response.json()
        assert "settings" in data
        assert isinstance(data["settings"], list)
        print(f"✓ Admin settings returned {len(data['settings'])} settings")
    
    def test_admin_settings_update(self, admin_session):
        """PUT /api/admin/settings saves a setting"""
        payload = {"key": "test_setting", "value": "test_value_123"}
        response = admin_session.put(f"{BASE_URL}/api/admin/settings", json=payload)
        assert response.status_code == 200
        assert "updated" in response.json().get("message", "").lower()
        
        settings_resp = admin_session.get(f"{BASE_URL}/api/admin/settings")
        settings = settings_resp.json().get("settings", [])
        test_setting = next((s for s in settings if s.get("key") == "test_setting"), None)
        assert test_setting is not None
        assert test_setting.get("value") == "test_value_123"
        print("✓ Admin setting saved and verified")
    
    def test_admin_products(self, admin_session):
        """GET /api/admin/products returns products for admin"""
        response = admin_session.get(f"{BASE_URL}/api/admin/products")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert "total" in data
        print(f"✓ Admin products returned {data['total']} products")
    
    def test_admin_orders(self, admin_session):
        """GET /api/admin/orders returns orders for admin"""
        response = admin_session.get(f"{BASE_URL}/api/admin/orders")
        assert response.status_code == 200
        data = response.json()
        assert "orders" in data
        assert "total" in data
        print(f"✓ Admin orders returned {data['total']} orders")
    
    def test_admin_users(self, admin_session):
        """GET /api/admin/users returns users for admin"""
        response = admin_session.get(f"{BASE_URL}/api/admin/users")
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert "total" in data
        for user in data["users"]:
            assert "password_hash" not in user
        print(f"✓ Admin users returned {data['total']} users (password_hash excluded)")


# ============ NEW TESTS FOR ITERATION 2 ============

class TestAdminProductUpdate:
    """Tests for admin product editing feature (NEW in iteration 2)"""
    
    @pytest.fixture
    def admin_session(self):
        """Get authenticated admin session"""
        session = requests.Session()
        resp = session.post(f"{BASE_URL}/api/auth/login", 
                            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert resp.status_code == 200
        return session
    
    def test_admin_update_product_endpoint_exists(self, admin_session):
        """PUT /api/admin/products/{id} endpoint exists and accepts valid fields"""
        # First get a product to update (if any exist)
        products_resp = admin_session.get(f"{BASE_URL}/api/admin/products")
        assert products_resp.status_code == 200
        products = products_resp.json().get("products", [])
        
        if len(products) > 0:
            product = products[0]
            printful_id = product.get("printful_id")
            
            # Test update with valid fields
            update_data = {
                "name": product.get("name", "Test Product"),
                "category": product.get("category", "other"),
                "description": "Test description update",
                "active": True,
                "featured": False,
                "sale_price": ""
            }
            response = admin_session.put(f"{BASE_URL}/api/admin/products/{printful_id}", json=update_data)
            assert response.status_code == 200
            assert "updated" in response.json().get("message", "").lower()
            print(f"✓ Admin product update endpoint working for product {printful_id}")
        else:
            # No products to test, but endpoint should still respond
            response = admin_session.put(f"{BASE_URL}/api/admin/products/999999", json={"active": True})
            assert response.status_code == 200  # Returns 200 even if no product found (no-op)
            print("✓ Admin product update endpoint exists (no products to test)")


class TestAdminAIAdGenerator:
    """Tests for AI Ad generator endpoint (NEW in iteration 2)"""
    
    @pytest.fixture
    def admin_session(self):
        """Get authenticated admin session"""
        session = requests.Session()
        resp = session.post(f"{BASE_URL}/api/auth/login", 
                            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert resp.status_code == 200
        return session
    
    def test_generate_ad_endpoint_exists(self, admin_session):
        """POST /api/admin/generate-ad endpoint exists"""
        # Test with missing product_name - should return 400
        response = admin_session.post(f"{BASE_URL}/api/admin/generate-ad", json={})
        assert response.status_code == 400
        assert "product name required" in response.json().get("detail", "").lower()
        print("✓ Admin generate-ad endpoint exists and validates input")
    
    def test_generate_ad_requires_admin(self):
        """POST /api/admin/generate-ad requires admin auth"""
        response = requests.post(f"{BASE_URL}/api/admin/generate-ad", json={"product_name": "Test"})
        assert response.status_code in [401, 403]
        print("✓ Admin generate-ad endpoint requires authentication")


class TestTryOnRenderEndpoint:
    """Tests for virtual try-on render endpoint (NEW in iteration 2)"""
    
    @pytest.fixture
    def user_session(self):
        """Get authenticated user session"""
        session = requests.Session()
        resp = session.post(f"{BASE_URL}/api/auth/login", 
                            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert resp.status_code == 200
        return session
    
    def test_tryon_render_endpoint_exists(self, user_session):
        """POST /api/tryon/render endpoint exists"""
        # This will fail because user has no photo, but endpoint should exist
        response = user_session.post(f"{BASE_URL}/api/tryon/render", json={
            "product_name": "Test Shirt",
            "product_description": "A test shirt"
        })
        # Should return 400 because no photo uploaded, not 404
        assert response.status_code == 400
        assert "no photo" in response.json().get("detail", "").lower()
        print("✓ Try-on render endpoint exists and validates photo requirement")
    
    def test_tryon_render_requires_auth(self):
        """POST /api/tryon/render requires authentication"""
        response = requests.post(f"{BASE_URL}/api/tryon/render", json={
            "product_name": "Test Shirt"
        })
        assert response.status_code == 401
        print("✓ Try-on render endpoint requires authentication")


class TestOrders:
    """Order endpoints tests"""
    
    def test_get_orders_authenticated(self):
        """GET /api/orders returns user's orders"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", 
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        
        response = session.get(f"{BASE_URL}/api/orders")
        assert response.status_code == 200
        data = response.json()
        assert "orders" in data
        assert isinstance(data["orders"], list)
        print(f"✓ Orders endpoint returned {len(data['orders'])} orders")
    
    def test_get_orders_unauthenticated(self):
        """GET /api/orders returns 401 when not authenticated"""
        response = requests.get(f"{BASE_URL}/api/orders")
        assert response.status_code == 401
        print("✓ Orders endpoint correctly rejects unauthenticated request")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
