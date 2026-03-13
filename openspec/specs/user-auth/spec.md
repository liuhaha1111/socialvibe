## ADDED Requirements

### Requirement: User can register with email and password
The system SHALL allow unauthenticated users to create an account using a valid email address and password through the application auth interface.

#### Scenario: Successful registration
- **WHEN** a user submits a unique valid email and a password that meets policy requirements
- **THEN** the system creates a new auth account and returns a successful registration response

#### Scenario: Registration rejected for duplicate email
- **WHEN** a user submits an email that already exists in the auth system
- **THEN** the system rejects registration with a client-visible validation error and does not create a second account

### Requirement: User can sign in and sign out
The system SHALL support email/password sign-in and explicit sign-out, and MUST maintain session state for authenticated navigation.

#### Scenario: Successful sign-in
- **WHEN** a registered user submits valid credentials
- **THEN** the system creates an authenticated session and marks the user as signed in

#### Scenario: Invalid credentials
- **WHEN** a user submits an incorrect email or password
- **THEN** the system returns an authentication failure and keeps the user unauthenticated

#### Scenario: Sign-out clears session
- **WHEN** an authenticated user chooses to sign out
- **THEN** the system invalidates local session state and treats subsequent protected actions as unauthenticated

### Requirement: Protected APIs require bearer authentication
The backend MUST require a valid bearer token for user-scoped APIs and SHALL resolve the current user from the verified token rather than a fixed profile id.

#### Scenario: Missing bearer token
- **WHEN** a request is made to a protected endpoint without an `Authorization` bearer token
- **THEN** the API responds with an unauthorized error envelope

#### Scenario: Invalid or expired bearer token
- **WHEN** a request is made with an invalid or expired bearer token
- **THEN** the API responds with an unauthorized error envelope and does not execute protected business logic

#### Scenario: Valid bearer token
- **WHEN** a request is made with a valid bearer token to a protected endpoint
- **THEN** the API executes using the authenticated user identity derived from that token

### Requirement: User profile is bootstrapped for new authenticated users
The system SHALL ensure a profile record exists for authenticated users, and MUST create a default profile record on first access when none exists.

#### Scenario: First authenticated access without profile row
- **WHEN** an authenticated user has no existing profile record
- **THEN** the system creates a default profile linked to the authenticated user id before returning profile data

#### Scenario: Existing profile remains stable
- **WHEN** an authenticated user with an existing profile accesses profile endpoints
- **THEN** the system returns and updates that existing profile without creating duplicates

### Requirement: Frontend enforces authenticated routing for protected pages
The frontend MUST gate protected pages behind authenticated session state and SHALL redirect unauthenticated users to the sign-in/registration entry path.

#### Scenario: Unauthenticated user opens protected page
- **WHEN** an unauthenticated user navigates to a protected route
- **THEN** the frontend redirects the user to the auth entry page

#### Scenario: Authenticated user opens protected page
- **WHEN** an authenticated user navigates to a protected route
- **THEN** the frontend renders the requested page and allows normal API interactions
