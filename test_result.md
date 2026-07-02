#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Resident Hub — Phase 1 mockup (Next.js JS + MongoDB). Social platform for apartment residents with mock Tenant SSO (custom JWT cookie), building isolation, consent-first discovery, reporting flow, and staff read-only moderation. Backend API implemented in /app/app/api/[[...path]]/route.js. Seeded via /app/scripts/seed.js."

backend:
  - task: "Mock SSO auth (POST /api/auth/sso, GET /api/auth/session, POST /api/auth/logout)"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "SSO sets httpOnly signed cookie for demo.resident@ or demo.staff@. session returns user+property; logout clears cookie. Verified manually with curl (resident login works)."
  - task: "Discover feed with building isolation + consent gate + filters (GET /api/discover)"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Returns only same-propertyId RESIDENTs with isOpenToMeeting=true, excludes self. Last name returned as initial only. Supports hobby/interest/recency query filters. Must verify a STAFF token is rejected (403) and the consent-hidden resident (Charlotte) is excluded."
  - task: "Resident profile view with building-isolation enforcement (GET /api/residents/[id])"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Returns full profile only if viewer is in same property as target; otherwise 403. Cross-property access must be blocked."
  - task: "Reports create (POST /api/reports)"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Creates report with status OPEN, validates reason enum + reportedUserId. Returns confirmation message."
  - task: "Staff overview metrics (GET /api/staff/overview)"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "STAFF-only. Aggregates totalResidents, pctOpenToMeeting, active/pending connections, messagesThisWeek, openReports for staff's property. Must reject RESIDENT token (403)."
  - task: "Staff reports queue + PATCH status (GET/PATCH /api/staff/reports)"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "STAFF-only. Lists reports scoped to staff's property, includes message snippet ONLY when report has messageId attached (staff read-only privacy). PATCH updates status + staffNotes and sets resolvedAt/resolvedByStaffId on RESOLVED/DISMISSED."
  - task: "Resident dashboard aggregate (GET /api/dashboard)"
    implemented: true
    working: "NA"
    file: "app/api/[[...path]]/route.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "RESIDENT-only read-only aggregate: newNeighbours (recent open, same property), upcomingEvents (property events), pendingRequests (incoming PENDING connections)."

frontend:
  - task: "Phase 1 pages (landing, login SSO, dashboard, discover, profile, staff overview, staff reports)"
    implemented: true
    working: "NA"
    file: "app/page.js and related"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Built. Frontend testing NOT yet requested by user."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 0
  run_ui: false

test_plan:
  current_focus:
    - "Mock SSO auth (POST /api/auth/sso, GET /api/auth/session, POST /api/auth/logout)"
    - "Discover feed with building isolation + consent gate + filters (GET /api/discover)"
    - "Resident profile view with building-isolation enforcement (GET /api/residents/[id])"
    - "Staff overview metrics (GET /api/staff/overview)"
    - "Staff reports queue + PATCH status (GET/PATCH /api/staff/reports)"
    - "Reports create (POST /api/reports)"
    - "Resident dashboard aggregate (GET /api/dashboard)"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    -agent: "main"
    -message: "Phase 1 backend implemented for Resident Hub. Auth uses a custom signed JWT in an httpOnly cookie named 'rh_session'. To authenticate: POST /api/auth/sso with body {\"role\":\"RESIDENT\"} (logs in Emma Tremblay, Bow River Lofts / Calgary) or {\"role\":\"STAFF\"} (logs in Sarah Mitchell, same property) — the Set-Cookie must be reused for subsequent requests (use a cookie jar). Please verify: (1) role enforcement — RESIDENT blocked from /api/staff/* with 403, STAFF blocked from /api/discover with 403; (2) BUILDING ISOLATION — discover only returns same-property residents and never the STAFF user; residents/[id] returns 403 for a user in a different property (pick an id from a different building — Kensington Court or Whyte Ave residents); (3) CONSENT gate — resident 'Charlotte Bergeron' (isOpenToMeeting=false) must NOT appear in discover; (4) PRIVACY — discover returns lastName as an initial only (e.g. 'M.'); (5) staff/reports message snippet appears ONLY for the report that has a messageId attached (the HARASSMENT report), and is null otherwise; (6) reports POST creates an OPEN report and returns the 24h confirmation message; (7) PATCH /api/staff/reports to RESOLVED sets resolvedAt. Seed already run. Do NOT test frontend."