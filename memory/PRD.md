# XI XVI Eleven Sixteen - Virtual Shopping Platform PRD

## Original Problem Statement
A virtual shopping experience for XI eleven XVI sixteen in which a user uploads a full length photo of themselves along with their height, and weight, and AI scans that photo and logs their body dimensions such as their arm length their leg length, etc., and also creates a virtual twin rendering of that photo that is stored and logged in the system and is used during the shopping experience. This system connects to the Printful API, and clothing specifications such as the length of shirts, length of pants, width, etc., depending on size will be live, match to provide the user with a recommendation of the correct size, and also the specifications will be used to render desired pieces onto the virtual twin, render with the goal of showing users exactly how the pieces will fit on their body.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI components
- **Backend**: FastAPI (Python) + MongoDB (Motor async driver)
- **AI Models**: OpenAI GPT-5.2 Vision + Gemini 2.5 Flash (body scanning), OpenAI GPT-5.2 (virtual twin & try-on analysis)
- **Storage**: Emergent Object Storage for user photos
- **External API**: Printful API v1 for product catalog and sync
- **Auth**: JWT with httpOnly cookies, bcrypt password hashing

## User Personas
1. **Shopper** - Uploads photo, gets body scanned, browses products, gets size recommendations, virtual try-on, places orders
2. **Admin** - Manages API keys, syncs products from Printful, manages orders/tracking, views users

## Core Requirements
- [x] User registration/login (JWT auth)
- [x] Photo upload with height/weight
- [x] AI dual-model body scanning (OpenAI + Gemini)
- [x] Virtual twin profile generation
- [x] Object storage for user photos
- [x] Product catalog from Printful (synced to MongoDB)
- [x] Category-based shopping with search/filter
- [x] AI-powered size recommendation engine
- [x] Virtual try-on analysis
- [x] Order placement and tracking
- [x] User profile with measurements and shipping address
- [x] Admin panel (dashboard, settings, products, orders, users)
- [x] Product sync from Printful API

## What's Been Implemented (April 17, 2026)
### Backend (server.py + modules)
- Full JWT auth (register, login, logout, me, refresh)
- Admin seeding and role-based access
- Photo upload + AI body scanning endpoint (/api/scan/upload)
- Product CRUD with Printful sync
- Size recommendation engine
- Virtual try-on analysis endpoint
- Order management (create, list, detail)
- Admin APIs (stats, settings, products, orders, users)

### Frontend (React)
- Landing page with hero, how-it-works, categories
- Auth pages (login, register)
- Shop page with category filters and search
- Product detail with size selector, AI recommendation, virtual try-on
- Body scanner page with photo upload
- Profile page with measurements and address
- Orders page with tracking
- Admin panel (5 tabs: dashboard, settings, products, orders, users)
- Luxury dark theme (black/gold, Playfair Display + Manrope)

### Iteration 2 (April 21, 2026)
- Imperial units as primary display with metric toggle (Switch component)
- Lighter/brighter color theme (cream #FAF8F5 background, dark text)
- Product editing in admin panel (Dialog with name, category, description, sale price, active, featured)
- Virtual try-on rendering toggle (text analysis vs AI image generation via GPT Image 1)
- Product photo carousel/gallery on product detail page
- Admin AI ad generator (GPT Image 1 creates campaign images from product descriptions)
- Unit conversion utilities (cm/inches, kg/lbs)

## Prioritized Backlog
### P0 (Critical)
- None remaining - all core flows functional

### P1 (High Priority)
- Printful API key needs to be set by admin for product sync
- Cart functionality (multi-item orders)
- Payment integration (Stripe)

### P2 (Medium)
- Image generation for virtual try-on visualization (GPT Image 1 / Gemini Nano Banana)
- Product reviews/ratings
- Wishlist functionality
- Email notifications for order status changes

### P3 (Nice to Have)
- Social login (Google Auth)
- Product recommendations based on body type
- Size comparison across brands
- Return/exchange management

## Next Tasks
1. Admin enters Printful API key and syncs products
2. Implement cart with multi-item support
3. Add Stripe payment integration
4. Enhance virtual try-on with image generation
5. Add email notifications for orders
