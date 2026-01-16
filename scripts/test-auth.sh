#!/bin/bash

# Sprint 2 Authentication Testing Script
echo "🧪 Testing Sprint 2 Authentication Flow..."
echo ""

BASE_URL="http://localhost:3000"
TEST_EMAIL="test@flux-stack.dev"
TEST_PASSWORD="Test123!@#"
TEST_NAME="Test User"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}Test 1: Signup${NC}"
echo -e "${BLUE}===================================================${NC}"
curl -v -X POST "$BASE_URL/api/auth/sign-up/email" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"$TEST_NAME\"}"
echo ""

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}Test 2: Login${NC}"
echo -e "${BLUE}===================================================${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/sign-in/email" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}Test 3: Access Protected Route (Authenticated)${NC}"
echo -e "${BLUE}===================================================${NC}"
ME_RESPONSE=$(curl -s "$BASE_URL/api/auth/me" -b cookies.txt)
echo "$ME_RESPONSE" | jq '.' 2>/dev/null || echo "$ME_RESPONSE"
echo ""

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}Test 4: Access Protected Route (Unauthenticated)${NC}"
echo -e "${BLUE}===================================================${NC}"
UNAUTH_RESPONSE=$(curl -s "$BASE_URL/api/auth/me")
echo "$UNAUTH_RESPONSE" | jq '.' 2>/dev/null || echo "$UNAUTH_RESPONSE"
echo ""

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}Test 5: Request Password Reset${NC}"
echo -e "${BLUE}===================================================${NC}"
RESET_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/forget-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"redirectTo\":\"$BASE_URL/reset-password\"}")

echo "$RESET_RESPONSE" | jq '.' 2>/dev/null || echo "$RESET_RESPONSE"
echo ""

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}Test 6: Request Email Verification${NC}"
echo -e "${BLUE}===================================================${NC}"
VERIFY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/send-verification-email" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"callbackURL\":\"$BASE_URL/verify\"}")

echo "$VERIFY_RESPONSE" | jq '.' 2>/dev/null || echo "$VERIFY_RESPONSE"
echo ""

# Cleanup
rm -f cookies.txt

echo -e "${GREEN}✅ All tests completed!${NC}"
echo -e "${BLUE}===================================================${NC}"
echo ""
echo "📋 Summary:"
echo "  - Check server console for email verification and password reset links"
echo "  - Rate limiting is enabled in production mode"
echo "  - Protected routes require authentication"
echo ""
