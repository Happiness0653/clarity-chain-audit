# ChainAudit

A compliance auditing tool for smart contracts on the Stacks blockchain. ChainAudit provides a framework for recording, tracking and verifying contract interactions for compliance and auditing purposes.

## Features
- Record contract interactions with timestamp and transaction details
- Track contract state changes 
- Generate audit reports
- Access control for auditors
- Event logging system
- Paginated event retrieval

## Usage
The contract provides the following main functions:
- `record-event`: Records an auditable event
- `add-auditor`: Adds a new authorized auditor
- `get-event`: Retrieves a single audit event by ID
- `get-events-page`: Retrieves a paginated list of audit events
- `get-event-count`: Gets total number of recorded events
- `is-auditor`: Checks if an account is an authorized auditor

### Pagination
The `get-events-page` function allows retrieval of audit events in pages of 10 events each. This helps manage large audit histories efficiently.

## Getting Started
[Installation and usage instructions...]
