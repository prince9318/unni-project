// ============================================
// CORRECTED & OPTIMIZED REACT COMPONENT
// ============================================

import React, { useState, useEffect, useRef } from "react";

const SearchUsers = () => {
  const [users, setUsers] = useState([]);
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(false); // ✅ PERFORMANCE FIX #4
  const [error, setError] = useState(null); // ✅ RELIABILITY FIX #6
  const debounceTimer = useRef(null); // ✅ PERFORMANCE FIX #3
  const abortControllerRef = useRef(null); // ✅ RELIABILITY FIX #5

  useEffect(() => {
    // ✅ PERFORMANCE FIX #3: DEBOUNCING
    // Clear previous timer if user is still typing
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // ✅ PERFORMANCE FIX #2: EMPTY SEARCH PREVENTION
    // Don't fetch if search term is empty
    if (!term || term.trim().length === 0) {
      setUsers([]);
      setError(null);
      return;
    }

    // ✅ RELIABILITY FIX #5: ABORT PREVIOUS REQUESTS
    // Cancel previous fetch if a new one starts
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Set timer to wait 500ms after user stops typing
    debounceTimer.current = setTimeout(async () => {
      const loadData = async () => {
        try {
          setLoading(true); // ✅ PERFORMANCE FIX #4: SHOW LOADING
          setError(null);

          // ✅ RELIABILITY FIX #5: USE ABORT SIGNAL
          const res = await fetch(
            `https://api.example.com/users?q=${encodeURIComponent(term)}`, // ✅ SECURITY FIX #1: URL ENCODING
            { signal: abortControllerRef.current.signal },
          );

          // ✅ RELIABILITY FIX #6: CHECK HTTP STATUS
          if (!res.ok) {
            throw new Error(`API Error: ${res.status} ${res.statusText}`);
          }

          const data = await res.json();

          // ✅ RELIABILITY FIX #7: VALIDATE RESPONSE DATA
          if (!Array.isArray(data)) {
            throw new Error("Invalid API response format");
          }

          setUsers(data);
        } catch (err) {
          // ✅ RELIABILITY FIX #6: ERROR HANDLING
          // Don't log error if request was aborted (normal behavior)
          if (err.name !== "AbortError") {
            console.error("Search error:", err);
            setError("Failed to load users. Please try again.");
            setUsers([]);
          }
        } finally {
          setLoading(false); // ✅ PERFORMANCE FIX #4: HIDE LOADING
        }
      };

      loadData();
    }, 500); // ✅ PERFORMANCE FIX #3: 500MS DEBOUNCE DELAY

    // ✅ RELIABILITY FIX #5: CLEANUP ON UNMOUNT
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [term]);

  return (
    <div>
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search users..."
      />

      {/* ✅ PERFORMANCE FIX #4: SHOW LOADING STATE */}
      {loading && <div className="loading">Searching...</div>}

      {/* ✅ RELIABILITY FIX #6: SHOW ERROR STATE */}
      {error && <div className="error">{error}</div>}

      {/* ✅ PERFORMANCE FIX #1: USE STABLE KEYS */}
      {/* ✅ RELIABILITY FIX #8: SHOW EMPTY STATE */}
      {!loading && !error && users.length === 0 && term && (
        <div className="no-results">No users found</div>
      )}

      {/* ✅ PERFORMANCE FIX #1: USE ID FROM DATA AS KEY (STABLE IDENTIFIER) */}
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default SearchUsers;

// ============================================
// DETAILED EXPLANATION OF EACH FIX
// ============================================

/**
 * ISSUE #1: USING MATH.RANDOM() AS REACT KEY
 * ===========================================
 *
 * ORIGINAL CODE (PROBLEMATIC ❌):
 * {users.map((u) => (
 *   <div key={Math.random()}>{u.name}</div>
 * ))}
 *
 * PROBLEM:
 * - Math.random() generates new value every render
 * - React uses keys to identify which items have changed
 * - With random keys, React thinks list is completely different each time
 * - React removes and recreates DOM elements unnecessarily
 * - Component state (focus, input) lost when list re-renders
 * - Performance issues with large lists
 * - Console warnings: "Warning: Each child in a list should have a unique key prop"
 *
 * REAL-WORLD EXAMPLE:
 * 1. User clicks on first item to expand it
 * 2. New search results arrive
 * 3. React re-renders with new random keys
 * 4. React thinks all items are new
 * 5. Removes old items and creates new ones
 * 6. User's clicked item collapsed (lost focus/state)
 * 7. User frustrated!
 *
 * CORRECTED CODE (BETTER ✅):
 * {users.map((u) => (
 *   <li key={u.id}>{u.name}</li>
 * ))}
 *
 * HOW IT WORKS:
 * - Uses unique, stable identifier from data (u.id)
 * - React recognizes same item across renders
 * - Only updates changed items (minimizes DOM manipulation)
 * - Component state preserved (focus, scroll position)
 * - No console warnings
 * - Better performance, consistent UX
 */

/**
 * ISSUE #2: FETCHING ON EVERY KEYSTROKE
 * =======================================
 *
 * ORIGINAL CODE (PROBLEMATIC ❌):
 * useEffect(() => {
 *   const loadData = async () => {
 *     const res = await fetch(`https://api.example.com/users?q=${term}`);
 *     // ...
 *   };
 *   loadData();
 * }, [term]); // Runs on EVERY term change
 *
 * PROBLEM:
 * - Effect runs immediately when term changes
 * - User types "J" → fetch sent
 * - User types "Jo" → fetch sent (2nd request)
 * - User types "Joh" → fetch sent (3rd request)
 * - For 10-character search: 10 API calls sent
 * - Wastes bandwidth, server resources
 * - Slow typing experience (waits for each response)
 * - Server can't handle load spike (DOS vulnerability)
 * - Faster typed character = slower response = bad UX
 *
 * PERFORMANCE IMPACT:
 * - User types "javascript" (10 chars): 10 requests
 * - @ 100ms per API call: 1 second total latency
 * - Last response might be irrelevant ("j") by the time it arrives
 * - User might get stale results for wrong search term
 *
 * CORRECTED CODE (BETTER ✅):
 * const debounceTimer = useRef(null);
 *
 * useEffect(() => {
 *   if (debounceTimer.current) {
 *     clearTimeout(debounceTimer.current);
 *   }
 *
 *   if (!term || term.trim().length === 0) {
 *     setUsers([]);
 *     return;
 *   }
 *
 *   debounceTimer.current = setTimeout(async () => {
 *     // Fetch only after user stops typing for 500ms
 *     const loadData = async () => { ... };
 *     loadData();
 *   }, 500);
 *
 *   return () => {
 *     if (debounceTimer.current) clearTimeout(debounceTimer.current);
 *   };
 * }, [term]);
 *
 * HOW IT WORKS:
 * - Waits 500ms after final keystroke before fetching
 * - If user types within 500ms, timer resets
 * - User types "javascript":
 *   - 10 keystrokes, but waits until typing stops
 *   - Only 1 API call made (after 500ms pause)
 * - Server load reduced by 90%
 * - Better user experience (no lag)
 * - Fewer unnecessary requests
 */

/**
 * ISSUE #3: MISSING LOADING STATE
 * ================================
 *
 * ORIGINAL CODE (PROBLEMATIC ❌):
 * const SearchUsers = () => {
 *   const [users, setUsers] = useState([]);
 *   const [term, setTerm] = useState("");
 *   // No loading state!
 *
 * return (
 *   <div>
 *     <input ... />
 *     {users.map(...)} // What's shown during fetch?
 *   </div>
 * );
 *
 * PROBLEM:
 * - User types search term
 * - Blank screen for 1-2 seconds while fetching
 * - User thinks component is broken
 * - No feedback that something is happening
 * - User clicks search multiple times (thinking it failed)
 * - Multiple requests sent unnecessarily
 * - Poor user experience
 *
 * USER PERSPECTIVE:
 * 1. Types "JavaScript"
 * 2. Screen goes blank
 * 3. Is it loading or broken? User can't tell
 * 4. Waits 1 second impatiently
 * 5. Clicks search button again
 * 6. Creates duplicate requests
 *
 * CORRECTED CODE (BETTER ✅):
 * const [loading, setLoading] = useState(false);
 *
 * // In try block:
 * setLoading(true);
 * const res = await fetch(...);
 * setUsers(data);
 * setLoading(false);
 *
 * // In JSX:
 * {loading && <div className="loading">Searching...</div>}
 *
 * HOW IT WORKS:
 * - Shows "Searching..." message during API call
 * - User knows something is happening (no frustration)
 * - Input remains visible and usable
 * - Prevents multiple clicks (user can see it's working)
 * - Professional, responsive feel
 * - Better user experience
 */

/**
 * ISSUE #4: NO ERROR HANDLING
 * ============================
 *
 * ORIGINAL CODE (PROBLEMATIC ❌):
 * const loadData = async () => {
 *   const res = await fetch(`https://api.example.com/users?q=${term}`);
 *   const data = await res.json();
 *   setUsers(data); // What if fetch failed?
 * };
 * loadData();
 *
 * PROBLEM:
 * - No try-catch block
 * - Network error → app crashes
 * - API returns 500 error → app crashes
 * - Invalid JSON → app crashes
 * - User sees blank page or error
 * - No recovery mechanism
 * - App becomes unstable
 *
 * SCENARIOS WHERE IT FAILS:
 * 1. User's internet disconnects
 *    - Fetch fails → Unhandled promise rejection
 *    - App stops working
 *
 * 2. API server returns 500 error
 *    - res.json() throws error
 *    - Unhandled error propagates
 *    - App crashes
 *
 * 3. User closes laptop, comes back
 *    - Component might still be unmounted
 *    - Fetch completes and tries to setState
 *    - React warning: "Can't update unmounted component"
 *    - Memory leak warning
 *
 * CORRECTED CODE (BETTER ✅):
 * const [error, setError] = useState(null);
 *
 * try {
 *   setLoading(true);
 *   setError(null);
 *
 *   if (!res.ok) {
 *     throw new Error(`API Error: ${res.status}`);
 *   }
 *
 *   const data = await res.json();
 *
 *   if (!Array.isArray(data)) {
 *     throw new Error("Invalid API response format");
 *   }
 *
 *   setUsers(data);
 * } catch (err) {
 *   if (err.name !== 'AbortError') {
 *     console.error("Search error:", err);
 *     setError("Failed to load users. Please try again.");
 *     setUsers([]);
 *   }
 * } finally {
 *   setLoading(false);
 * }
 *
 * HOW IT WORKS:
 * - Catches any fetch errors gracefully
 * - Checks HTTP status codes (not just network errors)
 * - Validates response data format
 * - Shows user-friendly error message
 * - Clears previous results on error
 * - Still disables loading state
 * - App remains stable and usable
 * - User can retry search
 */

/**
 * ISSUE #5: NO CLEANUP ON UNMOUNT
 * ================================
 *
 * ORIGINAL CODE (PROBLEMATIC ❌):
 * useEffect(() => {
 *   const loadData = async () => {
 *     const res = await fetch(...);
 *     const data = await res.json();
 *     setUsers(data); // Update state
 *   };
 *   loadData();
 * }, [term]); // No cleanup function!
 *
 * PROBLEM:
 * - When component unmounts, fetch might still be running
 * - Fetch completes after unmount
 * - setUsers tries to update state on unmounted component
 * - React warning: "Can't perform a React state update on an unmounted component"
 * - Can cause memory leaks
 * - Stale requests cause unnecessary processing
 * - App warns of memory leak issues
 *
 * SCENARIO:
 * 1. User opens search on page
 * 2. Types "Java" - requests starts
 * 3. User immediately navigates to different page
 * 4. Component unmounts
 * 5. API response arrives 1 second later
 * 6. Code tries to setUsers on unmounted component
 * 7. Console warning appears
 *
 * CORRECTED CODE (BETTER ✅):
 * const abortControllerRef = useRef(null);
 *
 * useEffect(() => {
 *   // Cancel previous fetch
 *   if (abortControllerRef.current) {
 *     abortControllerRef.current.abort();
 *   }
 *   abortControllerRef.current = new AbortController();
 *
 *   // ... fetch code ...
 *   const res = await fetch(url, {
 *     signal: abortControllerRef.current.signal
 *   });
 *
 *   return () => {
 *     if (abortControllerRef.current) {
 *       abortControllerRef.current.abort();
 *     }
 *   };
 * }, [term]);
 *
 * HOW IT WORKS:
 * - AbortController can cancel active fetches
 * - Cleanup function called when component unmounts
 * - Cancels any pending requests
 * - Prevents setState on unmounted component
 * - No memory leaks
 * - No console warnings
 * - Clean component lifecycle
 */

/**
 * ISSUE #6: SECURITY - URL NOT ENCODED
 * =====================================
 *
 * ORIGINAL CODE (PROBLEMATIC ❌):
 * const res = await fetch(`https://api.example.com/users?q=${term}`);
 *
 * PROBLEM:
 * - User input directly in URL
 * - Special characters can break URL
 * - User types: "React & JavaScript"
 * - URL becomes: /users?q=React & JavaScript
 * - The & is interpreted as query param separator
 * - API receives: q=React, JavaScript=(undefined)
 * - Wrong search results returned
 *
 * WORSE EXAMPLE:
 * User types: "users?admin=true"
 * URL becomes: /users?q=users?admin=true
 * Could cause unexpected behavior
 *
 * CORRECTED CODE (BETTER ✅):
 * const res = await fetch(
 *   `https://api.example.com/users?q=${encodeURIComponent(term)}`
 * );
 *
 * HOW IT WORKS:
 * - encodeURIComponent escapes special characters
 * - "React & JavaScript" → "React%20%26%20JavaScript"
 * - URL safe and unambiguous
 * - Server receives exact search term
 * - Correct results returned
 */

/**
 * SUMMARY OF IMPROVEMENTS
 * =======================
 *
 * ✅ FIX #1: Use stable keys (u.id) instead of Math.random()
 *    → Better performance, consistent UI, no console warnings
 *
 * ✅ FIX #2: Add debouncing (500ms Wait)
 *    → 90% fewer API calls, better responsiveness, less server load
 *
 * ✅ FIX #3: Add loading state
 *    → User feedback, prevents duplicate clicks, professional UX
 *
 * ✅ FIX #4: Add error handling
 *    → App stays stable, user-friendly error messages, graceful failure
 *
 * ✅ FIX #5: Cleanup on unmount with AbortController
 *    → No memory leaks, no console warnings, clean lifecycle
 *
 * ✅ FIX #6: URL encode user input
 *    → Correct search results, no special character issues, safer
 *
 * ✅ FIX #7: Add empty state
 *    → Better UX, clear feedback, professional appearance
 *
 * RESULT:
 * - Performance: 90% fewer API calls (debouncing)
 * - Reliability: Handles errors, network issues gracefully
 * - User Experience: Loading states, error messages, stable UI
 * - Code Quality: No memory leaks, no console warnings
 * - Security: Proper URL encoding
 * - Production-ready React component
 */
