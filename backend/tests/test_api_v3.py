"""
XI XVI API Backend Tests - Iteration 3
Tests for: Cart CRUD, Stripe checkout, Admin product deletion, Webhook endpoint
Plus regression tests for existing endpoints
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
        print(f"✓ Health check passed: {data}")


class TestAuthRegression:
    """Auth regression tests from previous iterations"""
    
    def test_login_admin(self):
        """POST /api/auth/login with admin credentials"""
        session = requests.Session()
        payload = {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        response = session.post(f"{BASE_URL}/api/auth/login", json=payload)
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert data.get("email") == ADMIN_EMAIL
        assert data.get("role") == "admin"
        print(f"✓ Admin login successful: {data['email']}")
    
    def test_login_invalid_credentials(self):
        """POST /api/auth/login with wrong password returns 401"""
        payload = {"email": ADMIN_EMAIL, "password": "wrongpassword"}
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        assert response.status_code == 401
        print("✓ Invalid credentials rejected correctly")


# ============ NEW TESTS FOR ITERATION 3 - CART ============

class TestCartEndpoints:
    """Tests for Cart CRUD endpoints (NEW in iteration 3)"""
    
    @pytest.fixture
    def user_session(self):
        """Get authenticated user session"""
        session = requests.Session()
        resp = session.post(f"{BASE_URL}/api/auth/login", 
                            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert resp.status_code == 200
        return session
    
    def test_get_cart_empty(self, user_session):
        """GET /api/cart returns empty cart for authenticated user"""
        # First clear any existing cart
        user_session.delete(f"{BASE_URL}/api/cart")
        
        response = user_session.get(f"{BASE_URL}/api/cart")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert isinstance(data["items"], list)
        assert data["total"] == 0 or len(data["items"]) == 0
        print(f"✓ GET /api/cart returns empty cart: items={len(data['items'])}, total={data['total']}")
    
    def test_get_cart_unauthenticated(self):
        """GET /api/cart returns 401 when not authenticated"""
        response = requests.get(f"{BASE_URL}/api/cart")
        assert response.status_code == 401
        print("✓ GET /api/cart correctly rejects unauthenticated request")
    
    def test_add_to_cart_nonexistent_product(self, user_session):
        """POST /api/cart/add with non-existent product returns 404"""
        payload = {
            "product_printful_id": 999999999,  # Non-existent product
            "variant_index": 0,
            "size": "M",
            "color": "Black",
            "quantity": 1
        }
        response = user_session.post(f"{BASE_URL}/api/cart/add", json=payload)
        assert response.status_code == 404
        assert "not found" in response.json().get("detail", "").lower()
        print("✓ POST /api/cart/add correctly returns 404 for non-existent product")
    
    def test_add_to_cart_unauthenticated(self):
        """POST /api/cart/add returns 401 when not authenticated"""
        payload = {
            "product_printful_id": 12345,
            "variant_index": 0,
            "quantity": 1
        }
        response = requests.post(f"{BASE_URL}/api/cart/add", json=payload)
        assert response.status_code == 401
        print("✓ POST /api/cart/add correctly rejects unauthenticated request")
    
    def test_remove_from_cart_nonexistent_item(self, user_session):
        """DELETE /api/cart/{item_id} with non-existent item returns cart"""
        response = user_session.delete(f"{BASE_URL}/api/cart/nonexistent-item-id")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        print("✓ DELETE /api/cart/{item_id} handles non-existent item gracefully")
    
    def test_clear_cart(self, user_session):
        """DELETE /api/cart clears the cart"""
        response = user_session.delete(f"{BASE_URL}/api/cart")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert len(data["items"]) == 0
        assert data["total"] == 0
        print("✓ DELETE /api/cart clears cart successfully")
    
    def test_clear_cart_unauthenticated(self):
        """DELETE /api/cart returns 401 when not authenticated"""
        response = requests.delete(f"{BASE_URL}/api/cart")
        assert response.status_code == 401
        print("✓ DELETE /api/cart correctly rejects unauthenticated request")


# ============ NEW TESTS FOR ITERATION 3 - CHECKOUT ============

class TestCheckoutEndpoints:
    """Tests for Stripe checkout endpoints (NEW in iteration 3)"""
    
    @pytest.fixture
    def user_session(self):
        """Get authenticated user session"""
        session = requests.Session()
        resp = session.post(f"{BASE_URL}/api/auth/login", 
                            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert resp.status_code == 200
        return session
    
    def test_checkout_create_empty_cart(self, user_session):
        """POST /api/checkout/create with empty cart returns 400"""
        # First clear the cart
        user_session.delete(f"{BASE_URL}/api/cart")
        
        response = user_session.post(f"{BASE_URL}/api/checkout/create", json={
            "origin_url": "https://test.com"
        })
        assert response.status_code == 400
        assert "empty" in response.json().get("detail", "").lower()
        print("✓ POST /api/checkout/create correctly returns 400 for empty cart")
    
    def test_checkout_create_unauthenticated(self):
        """POST /api/checkout/create returns 401 when not authenticated"""
        response = requests.post(f"{BASE_URL}/api/checkout/create", json={})
        assert response.status_code == 401
        print("✓ POST /api/checkout/create correctly rejects unauthenticated request")
    
    def test_checkout_status_unauthenticated(self):
        """GET /api/checkout/status/{session_id} returns 401 when not authenticated"""
        response = requests.get(f"{BASE_URL}/api/checkout/status/test_session_id")
        assert response.status_code == 401
        print("✓ GET /api/checkout/status correctly rejects unauthenticated request")


# ============ NEW TESTS FOR ITERATION 3 - WEBHOOK ============

class TestStripeWebhook:
    """Tests for Stripe webhook endpoint (NEW in iteration 3)"""
    
    def test_webhook_endpoint_exists(self):
        """POST /api/webhook/stripe endpoint exists"""
        # Send a minimal request - it should not return 404
        response = requests.post(f"{BASE_URL}/api/webhook/stripe", 
                                 data=b"test", 
                                 headers={"Content-Type": "application/json"})
        # Should return 200 (webhook handles errors gracefully) or validation error, not 404
        assert response.status_code != 404
        print(f"✓ POST /api/webhook/stripe endpoint exists (status: {response.status_code})")


# ============ NEW TESTS FOR ITERATION 3 - ADMIN DELETE PRODUCT ============

class TestAdminDeleteProduct:
    """Tests for admin product deletion (NEW in iteration 3)"""
    
    @pytest.fixture
    def admin_session(self):
        """Get authenticated admin session"""
        session = requests.Session()
        resp = session.post(f"{BASE_URL}/api/auth/login", 
                            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert resp.status_code == 200
        return session
    
    def test_delete_product_nonexistent(self, admin_session):
        """DELETE /api/admin/products/{id} with non-existent product returns 404"""
        response = admin_session.delete(f"{BASE_URL}/api/admin/products/999999999")
        assert response.status_code == 404
        assert "not found" in response.json().get("detail", "").lower()
        print("✓ DELETE /api/admin/products/{id} correctly returns 404 for non-existent product")
    
    def test_delete_product_unauthenticated(self):
        """DELETE /api/admin/products/{id} returns 401/403 when not authenticated"""
        response = requests.delete(f"{BASE_URL}/api/admin/products/12345")
        assert response.status_code in [401, 403]
        print("✓ DELETE /api/admin/products/{id} correctly rejects unauthenticated request")
    
    def test_delete_product_non_admin(self):
        """DELETE /api/admin/products/{id} returns 403 for non-admin user"""
        # Register a new non-admin user
        session = requests.Session()
        test_email = f"TEST_nonadmin_{uuid.uuid4().hex[:8]}@test.com"
        session.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "password": "testpass123",
            "name": "Non Admin User"
        })
        
        response = session.delete(f"{BASE_URL}/api/admin/products/12345")
        assert response.status_code == 403
        print("✓ DELETE /api/admin/products/{id} correctly rejects non-admin user")


# ============ REGRESSION TESTS ============

class TestProductsRegression:
    """Product endpoints regression tests"""
    
    def test_get_products(self):
        """GET /api/products returns product list"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert "total" in data
        assert "categories" in data
        print(f"✓ Products endpoint returned {data['total']} products")


class TestAdminRegression:
    """Admin endpoints regression tests"""
    
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
        print(f"✓ Admin stats: users={data['total_users']}, products={data['total_products']}")
    
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
        print(f"✓ Admin orders returned {data['total']} orders")


class TestOrdersRegression:
    """Order endpoints regression tests"""
    
    def test_get_orders_authenticated(self):
        """GET /api/orders returns user's orders"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", 
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        
        response = session.get(f"{BASE_URL}/api/orders")
        assert response.status_code == 200
        data = response.json()
        assert "orders" in data
        print(f"✓ Orders endpoint returned {len(data['orders'])} orders")


class TestProfileRegression:
    """Profile endpoints regression tests"""
    
    def test_get_profile_authenticated(self):
        """GET /api/profile returns user profile"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", 
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        
        response = session.get(f"{BASE_URL}/api/profile")
        assert response.status_code == 200
        data = response.json()
        assert "email" in data
        print(f"✓ Profile endpoint returned user: {data['email']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
