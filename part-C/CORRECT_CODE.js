// ============================================
// CORRECTED & SECURE CODE
// ============================================

app.get(
  "/api/admin/reports",
  verifyToken, // ✅ Verify user is authenticated
  verifyRole("admin"), // ✅ Verify user is admin (SECURITY FIX #1)
  async (req, res) => {
    try {
      // ✅ SECURITY FIX #2: INPUT VALIDATION
      const { category, page = 1, limit = 20 } = req.query;

      // Type checking for category parameter
      if (!category || typeof category !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid request parameters",
        });
      }

      // ✅ SECURITY FIX #3: WHITELIST VALIDATION
      // Only allow predefined categories
      const allowedCategories = [
        "sales",
        "inventory",
        "support",
        "financial",
        "operational",
      ];

      const sanitizedCategory = category.trim().toLowerCase();

      if (!allowedCategories.includes(sanitizedCategory)) {
        return res.status(400).json({
          success: false,
          error: "Invalid report category",
        });
      }

      // ✅ SECURITY FIX #4: PAGINATION BOUNDS
      // Prevent denial of service attacks
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
      const offset = (pageNum - 1) * limitNum;

      // ✅ SECURITY FIX #5: PARAMETERIZED QUERIES (SQL INJECTION PREVENTION)
      // Using ? placeholders instead of string concatenation
      const query = `
        SELECT id, title, category, created_at, updated_at
        FROM reports
        WHERE category = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;

      // ✅ SECURITY FIX #6: SPECIFIC COLUMNS (not SELECT *)
      // Only retrieve necessary columns, hide sensitive internal data
      const [results] = await db.query(query, [
        sanitizedCategory,
        limitNum,
        offset,
      ]);

      // Get total count for pagination
      const countQuery =
        "SELECT COUNT(*) as total FROM reports WHERE category = ?";
      const [countResult] = await db.query(countQuery, [sanitizedCategory]);
      const total = countResult[0].total;

      // ✅ SECURITY FIX #7: CONSISTENT & STRUCTURED RESPONSE
      res.json({
        success: true,
        data: results || [],
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      // ✅ SECURITY FIX #8: SECURE ERROR HANDLING
      console.error("Admin reports endpoint error:", error);

      // Send generic error to client (don't expose DB details)
      res.status(500).json({
        success: false,
        error: "Failed to retrieve reports",
      });
    }
  },
);

// ============================================
// DETAILED EXPLANATION OF EACH FIX
// ============================================

/**
 * VULNERABILITY #1: SQL INJECTION
 * ================================
 *
 * ORIGINAL CODE (VULNERABLE ❌):
 * const query = "SELECT * FROM reports WHERE category = '" + category + "'";
 *
 * PROBLEM:
 * - User input directly concatenated into SQL query
 * - Attacker can inject SQL commands
 *
 * ATTACK EXAMPLE:
 * Input: category = "home' OR '1'='1"
 * Query becomes: SELECT * FROM reports WHERE category = 'home' OR '1'='1'
 * Result: Returns ALL rows (bypasses intended filtering)
 *
 * WORSE ATTACK:
 * Input: category = "home'; DROP TABLE reports; --"
 * Query becomes: SELECT * FROM reports WHERE category = 'home'; DROP TABLE reports; --'
 * Result: Database table deleted!
 *
 * CORRECTED CODE (SECURE ✅):
 * const query = `SELECT ... WHERE category = ? LIMIT ? OFFSET ?`;
 * const [results] = await db.query(query, [sanitizedCategory, limitNum, offset]);
 *
 * HOW IT WORKS:
 * - Uses parameterized queries with ? placeholders
 * - Database driver separates SQL code from data
 * - User input is automatically escaped and treated as literal data
 * - Even if attacker sends: home' OR '1'='1
 * - Database receives: Search for literal text "home' OR '1'='1" in column
 * - Result: No match found, safe query execution
 */

/**
 * VULNERABILITY #2: MISSING INPUT VALIDATION
 * ===========================================
 *
 * ORIGINAL CODE (VULNERABLE ❌):
 * const { category } = req.query; // Used directly without any checks
 *
 * PROBLEM:
 * - No type checking (could be null, undefined, object, array, etc.)
 * - No length restrictions (could send 10MB of garbage)
 * - No format validation (any string accepted)
 * - No whitelist of allowed values
 *
 * CORRECTED CODE (SECURE ✅):
 * if (!category || typeof category !== "string") {
 *   return res.status(400).json({ error: "Invalid request parameters" });
 * }
 *
 * const allowedCategories = ["sales", "inventory", "support", "financial", "operational"];
 * const sanitizedCategory = category.trim().toLowerCase();
 * if (!allowedCategories.includes(sanitizedCategory)) {
 *   return res.status(400).json({ error: "Invalid report category" });
 * }
 *
 * HOW IT WORKS:
 * - Checks if category exists and is a string
 * - Validates against whitelist of known categories
 * - Normalizes input (trim whitespace, lowercase for consistency)
 * - Rejects anything not in the list
 * - Fails fast with clear error messages
 */

/**
 * VULNERABILITY #3: NO ROLE-BASED ACCESS CONTROL
 * ===============================================
 *
 * ORIGINAL CODE (VULNERABLE ❌):
 * app.get("/api/admin/reports", verifyToken, async (req, res) => {
 *
 * PROBLEM:
 * - Only verifyToken middleware used
 * - verifyToken checks if user is logged in, NOT if they're admin
 * - Any authenticated user (regular employee, etc.) can access admin reports
 * - Violates principle of least privilege
 *
 * EXAMPLE ATTACK:
 * 1. Regular employee logs in successfully
 * 2. Gets valid JWT token from verifyToken
 * 3. Can access /api/admin/reports without being admin
 * 4. Sees confidential financial reports they shouldn't access
 *
 * CORRECTED CODE (SECURE ✅):
 * app.get(
 *   "/api/admin/reports",
 *   verifyToken,       // Checks: Is user logged in?
 *   verifyRole("admin"), // Checks: Is user an admin?
 *   async (req, res) => {
 *
 * HOW IT WORKS:
 * - verifyToken: Validates JWT, confirms authentication
 * - verifyRole("admin"): Checks user.role === "admin" in JWT payload
 * - Both must pass before reaching endpoint
 * - Regular users get 403 Forbidden error
 * - Only actual admins can access admin endpoints
 */

/**
 * VULNERABILITY #4: SELECT * RETURNS ALL COLUMNS
 * =============================================
 *
 * ORIGINAL CODE (VULNERABLE ❌):
 * const query = "SELECT * FROM reports WHERE category = '" + category + "'";
 *
 * PROBLEM:
 * - Returns all columns from reports table
 * - May include sensitive internal data:
 *   - Internal notes/discussions
 *   - Financial calculations/costs
 *   - Internal IDs linking to other systems
 *   - Timestamps revealing operational patterns
 *   - Data not meant for external consumption
 * - Expands attack surface unnecessarily
 *
 * CORRECTED CODE (SECURE ✅):
 * const query = `
 *   SELECT id, title, category, created_at, updated_at
 *   FROM reports WHERE category = ?
 * `;
 *
 * HOW IT WORKS:
 * - Explicitly lists ONLY needed columns
 * - Sensitive internal columns never sent to client
 * - Client can't accidentally display secret data
 * - Database performance improved (less data transfer)
 * - Security principle: "Give minimum necessary information"
 */

/**
 * VULNERABILITY #5: NO PAGINATION = DENIAL OF SERVICE
 * ====================================================
 *
 * ORIGINAL CODE (VULNERABLE ❌):
 * const result = await db.query(query);
 * res.json(result.rows); // All rows returned
 *
 * PROBLEM:
 * - No limit on query results
 * - If "sales" category has 10 million reports:
 *   - All 10 million rows loaded into memory
 *   - Server runs out of RAM, crashes
 *   - Response takes hours to send
 *   - Network bandwidth exhausted
 * - Attacker can easily trigger denial of service
 *
 * ATTACK EXAMPLE:
 * GET /api/admin/reports?category=sales
 * Server tries to return all 10 million reports
 * Within seconds: Out of memory, server crashes
 * Result: Service down for all users
 *
 * CORRECTED CODE (SECURE ✅):
 * const { page = 1, limit = 20 } = req.query;
 * const pageNum = Math.max(1, parseInt(page) || 1);
 * const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
 * const offset = (pageNum - 1) * limitNum;
 * const query = `...LIMIT ? OFFSET ?`;
 * await db.query(query, [sanitizedCategory, limitNum, offset]);
 *
 * HOW IT WORKS:
 * - Default: 20 items per page
 * - Maximum: 100 items per page (even if client requests more)
 * - Validates page number (at least 1)
 * - Calculates offset for pagination
 * - Only requested page of results returned
 * - Memory usage stays constant
 * - Response time stays fast
 * - Server can't be crashed with unlimited data requests
 */

/**
 * VULNERABILITY #6: INCONSISTENT RESPONSE FORMAT
 * ===============================================
 *
 * ORIGINAL CODE (VULNERABLE ❌):
 * if (result.rows.length === 0) {
 *   res.send("No reports found");  // Plain text!
 * } else {
 *   res.json(result.rows);  // JSON array
 * }
 *
 * PROBLEM:
 * - Empty result sends plain text
 * - With results sends JSON
 * - Frontend code must handle both formats
 * - Error-prone parsing
 * - Inconsistent with REST API standards
 * - Hard to determine success/failure
 *
 * FRONTEND CODE MUST DO THIS:
 * const response = await fetch("/api/admin/reports?category=sales");
 * const contentType = response.headers.get("content-type");
 * if (contentType.includes("text/plain")) {
 *   // Handle plain text
 * } else {
 *   // Handle JSON
 * }
 * // Messy and error-prone!
 *
 * CORRECTED CODE (SECURE ✅):
 * res.json({
 *   success: true,
 *   data: results || [],
 *   pagination: {
 *     total,
 *     page: pageNum,
 *     limit: limitNum,
 *     pages: Math.ceil(total / limitNum)
 *   }
 * });
 *
 * HOW IT WORKS:
 * - Always returns JSON with consistent structure
 * - success field indicates success/failure
 * - data field contains the results
 * - pagination field has metadata
 * - Frontend knows exactly what to expect
 * - Easy parsing and error handling
 * - Professional API standard
 *
 * FRONTEND CODE IS SIMPLE:
 * const response = await fetch("/api/admin/reports?category=sales");
 * const json = await response.json();
 * if (json.success) {
 *   console.log(json.data);
 *   console.log(`Page ${json.pagination.page} of ${json.pagination.pages}`);
 * } else {
 *   console.error(json.error);
 * }
 * // Clean and reliable!
 */

/**
 * VULNERABILITY #7: INSECURE ERROR HANDLING
 * ==========================================
 *
 * ORIGINAL CODE (VULNERABLE ❌):
 * catch (e) {
 *   res.status(500).json({ error: "Check DB" });
 * }
 *
 * PROBLEM:
 * - Error message exposes that a database exists
 * - Tells attacker they're attacking the right service
 * - Generic message doesn't help legitimate users
 * - No logging for debugging
 * - Attacker gets reconnaissance information
 *
 * ATTACK RECONNAISSANCE:
 * 1. Attacker sends random requests to various endpoints
 * 2. Sees "Check DB" error
 * 3. Now knows: "This service uses a database"
 * 4. Tailors future attacks accordingly
 * 5. May try database-specific exploits
 *
 * CORRECTED CODE (SECURE ✅):
 * catch (error) {
 *   console.error("Admin reports endpoint error:", error);  // Log internally
 *   res.status(500).json({
 *     success: false,
 *     error: "Failed to retrieve reports"  // Generic message to client
 *   });
 * }
 *
 * HOW IT WORKS:
 * - Detailed error logged to server console for debugging
 * - Developers can see full error stack traces
 * - Generic message sent to client (no tech details)
 * - Attacker learns nothing about infrastructure
 * - Users still see helpful "Something went wrong" message
 * - Security principle: "Fail securely, log verbosely"
 */

/**
 * SUMMARY OF SECURITY IMPROVEMENTS
 * =================================
 *
 * ✅ FIX #1: Parameterized queries prevent SQL injection
 * ✅ FIX #2: Input validation prevents malformed data
 * ✅ FIX #3: Whitelist prevents unexpected values
 * ✅ FIX #4: Role-based access control enforces authorization
 * ✅ FIX #5: Specific columns reduce data exposure
 * ✅ FIX #6: Pagination prevents denial of service
 * ✅ FIX #7: Consistent response format improves reliability
 * ✅ FIX #8: Secure error handling prevents information disclosure
 *
 * RESULT:
 * - Secure against SQL injection attacks
 * - Protected from unauthorized access
 * - Resistant to denial of service
 * - Professional, reliable API
 * - Production-ready code
 */
