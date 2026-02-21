app.get("/api/admin/reports", verifyToken, async (req, res) => {
  const { category } = req.query;
  try {
    const query = "SELECT * FROM reports WHERE category = '" + category + "'";
    const result = await db.query(query);
    if (result.rows.length === 0) {
      res.send("No reports found");
    } else {
      res.json(result.rows);
    }
  } catch (e) {
    res.status(500).json({ error: "Check DB" });
  }
});


// Task
// 1. Identify security vulnerabilities and bad API practice
// 2. Refactor the code
// 3. Explain how the changes improve security
