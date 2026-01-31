# User & Role Management — Functional Specification (MVP)

## Purpose
Allow Admin to manage users and assign roles securely.

## Users
- Admin only

## Core Features
- Add User
- Edit User
- Enable / Disable User
- Assign Role

## Roles Supported
- Admin
- Doctor
- OPD Reception
- OT Reception

## Fields
- Username
- Full Name
- Role
- Status (Active / Disabled)
- Password (admin-set/reset)

## Functional Rules
- Disabled users cannot log in
- One role per user (MVP)
- Username must be unique

## UI Behavior
- List of users shown in table
- Status toggle for enable/disable
- Inline edit support

## Audit
- Track created by / updated by (future-ready)