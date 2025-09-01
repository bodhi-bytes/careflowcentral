# Email Configuration Setup Guide

## Overview
This guide will help you set up email functionality for automatically sending credentials to newly created clients and staff members.

## Prerequisites
1. A Gmail account (or any other email service)
2. App-specific password for Gmail (recommended for security)

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Email Configuration

### Option 1: Gmail Setup (Recommended)
1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Enable 2-Step Verification if not already enabled
4. Go to Security → App passwords
5. Generate a new app password for "Mail"
6. Copy the generated 16-character password

### Option 2: Other Email Services
You can modify the `config/emailConfig.js` file to use other email services like:
- SendGrid
- AWS SES
- Outlook
- Yahoo Mail

## Step 3: Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/careflowcentral
DB_NAME=careflowcentral

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super<execute_command>
<command>npm install</command>
</execute_command>
