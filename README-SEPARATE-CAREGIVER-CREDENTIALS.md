# Separate Caregiver Credentials System

## Overview
This system implements **user credential forwarding property for staffs** by separating caregiver credentials from the main authentication system.

## Changes Made
1. **Removed caregivers from main auth system** - Caregiver credentials are now handled separately
2. **Created separate CaregiverCredentials model** - Stores caregiver credentials independently
3. **Updated staff controller** - Handles caregiver credentials separately
4. **Created caregiver auth controller** - Provides separate authentication endpoints

## Usage
### For Caregiver Staff
- Caregiver credentials are stored in the separate `CaregiverCredentials` model
- Caregiver credentials are used in a separate app/system
- Caregiver credentials are not part of the main User model

### For Non-Caregiver Staff
- Regular user accounts are created in the main User model
- Regular credentials are used in the main system

## Implementation
- Caregiver credentials are stored separately from main User model
- Caregiver credentials are used in a separate caregiver app
- Caregiver credentials are excluded from main auth system

## Summary
The implementation successfully separates caregiver credentials from the main authentication system, providing a unified credential forwarding property for staffs while maintaining security and separation of concerns.
