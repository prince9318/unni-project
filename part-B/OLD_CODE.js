const SearchUsers = () => {
  const [users, setUsers] = useState([]);
  const [term, setTerm] = useState("");
  useEffect(() => {
    const loadData = async () => {
      const res = await fetch(`https://api.example.com/users?q=${term}`);
      const data = await res.json();
      setUsers(data);
    };
    loadData();
  }, [term]);
  return (
    <div>
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      {users.map((u) => (
        <div key={Math.random()}>{u.name}</div>
      ))}
    </div>
  );
};

// Task
// 1. Identify three major issues
// 2. Provide a refactored version
// 3. Explain how the fixes improve performance and reliability
