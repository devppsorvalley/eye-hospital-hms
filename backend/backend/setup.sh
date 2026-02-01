#!/bin/bash

# ============================================================================
# Eye Hospital HMS - Local Setup Script
# ============================================================================
# This script automates the setup of PostgreSQL, database creation, 
# and backend initialization for macOS development
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Functions
# ============================================================================

print_header() {
  echo -e "\n${BLUE}==============================================================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}==============================================================================${NC}\n"
}

print_success() {
  echo -e "${GREEN}✅  $1${NC}"
}

print_error() {
  echo -e "${RED}❌  $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# ============================================================================
# Main Script
# ============================================================================

print_header "Eye Hospital HMS - Local Setup Script"

echo "This script will:"
echo "  1. Check/Install Homebrew"
echo "  2. Install PostgreSQL 15"
echo "  3. Create eye_hospital_hms database"
echo "  4. Install backend dependencies"
echo "  5. Run database migrations and seeding"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  print_warning "Setup cancelled"
  exit 1
fi

# ============================================================================
# Check Homebrew
# ============================================================================

print_header "Step 1: Checking Homebrew"

if ! command -v brew &> /dev/null; then
  print_warning "Homebrew not found. Installing..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  print_success "Homebrew installed"
else
  BREW_VERSION=$(brew --version | head -1)
  print_success "Homebrew found: $BREW_VERSION"
fi

# ============================================================================
# Check/Install PostgreSQL
# ============================================================================

print_header "Step 2: Setting up PostgreSQL"

if command -v psql &> /dev/null; then
  PG_VERSION=$(psql --version)
  print_success "PostgreSQL already installed: $PG_VERSION"
else
  print_info "Installing PostgreSQL 15..."
  brew install postgresql@15
  print_success "PostgreSQL installed"
fi

# ============================================================================
# Start PostgreSQL Service
# ============================================================================

print_header "Step 3: Starting PostgreSQL Service"

if brew services list | grep -q "postgresql@15.*started"; then
  print_success "PostgreSQL service is already running"
else
  print_info "Starting PostgreSQL service..."
  brew services start postgresql@15
  sleep 2  # Wait for service to start
  print_success "PostgreSQL service started"
fi

# ============================================================================
# Create Database
# ============================================================================

print_header "Step 4: Creating HMS Database"

if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "eye_hospital_hms"; then
  print_success "Database 'eye_hospital_hms' already exists"
else
  print_info "Creating database 'eye_hospital_hms'..."
  createdb -U postgres eye_hospital_hms
  print_success "Database created"
fi

# ============================================================================
# Setup Backend
# ============================================================================

print_header "Step 5: Setting up Backend"

BACKEND_DIR="backend"

if [ ! -d "$BACKEND_DIR" ]; then
  print_error "Backend directory not found. Make sure you're in the project root."
  exit 1
fi

cd "$BACKEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  print_info "Installing backend dependencies..."
  npm install
  print_success "Dependencies installed"
else
  print_success "Dependencies already installed"
fi

# ============================================================================
# Create .env File
# ============================================================================

print_header "Step 6: Configuring Environment Variables"

if [ -f ".env" ]; then
  print_info "Updating existing .env file..."
  # Backup existing env
  cp .env .env.backup
  print_success "Backed up existing .env to .env.backup"
else
  print_info "Creating .env file..."
fi

cat > .env << EOF
# Server
PORT=3000
NODE_ENV=development

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=eye_hospital_hms

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2026
JWT_EXPIRES_IN=7d

# Logging
LOG_LEVEL=info
EOF

print_success ".env file created"

# ============================================================================
# Run Database Migrations & Seeding
# ============================================================================

print_header "Step 7: Running Database Migrations"

print_info "This may take a minute..."

if npm run migrate; then
  print_success "Migrations completed"
else
  print_error "Migration failed. Check your PostgreSQL setup."
  exit 1
fi

# ============================================================================
# Seed Data
# ============================================================================

print_header "Step 8: Seeding Master Data"

if npm run seed; then
  print_success "Data seeding completed"
else
  print_error "Seeding failed."
  exit 1
fi

# ============================================================================
# Validate Database
# ============================================================================

print_header "Step 9: Validating Database Setup"

if npm run validate; then
  print_success "Database validation successful"
else
  print_error "Database validation failed."
  exit 1
fi

# ============================================================================
# Summary
# ============================================================================

print_header "✅  Setup Complete!"

echo "Your Eye Hospital HMS system is ready to use!"
echo ""
echo "Next steps:"
echo "  1. Start the server:"
echo "     ${BLUE}npm run dev${NC}"
echo ""
echo "  2. Test the API:"
echo "     ${BLUE}curl http://localhost:3000/health${NC}"
echo ""
echo "  3. Login with test user:"
echo "     Username: ${YELLOW}admin${NC}"
echo "     Password: ${YELLOW}admin123${NC}"
echo ""
echo "  4. See API documentation:"
echo "     ${BLUE}cat src/modules/auth/AUTH_API.md${NC}"
echo ""
echo "PostgreSQL Service Management:"
echo "  Start:   ${BLUE}brew services start postgresql@15${NC}"
echo "  Stop:    ${BLUE}brew services stop postgresql@15${NC}"
echo "  Status:  ${BLUE}brew services list${NC}"
echo ""
echo "Database Management:"
echo "  Connect: ${BLUE}psql -U postgres -d eye_hospital_hms${NC}"
echo "  Backup:  ${BLUE}pg_dump -U postgres eye_hospital_hms > backup.sql${NC}"
echo ""
print_success "Happy coding! 🚀"
