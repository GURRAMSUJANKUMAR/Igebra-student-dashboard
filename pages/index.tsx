import { useEffect, useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer,
  ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Legend, Line
} from "recharts";

export default function Dashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  useEffect(() => {
    fetch("/students_with_personas.json")
      .then(res => res.json())
      .then(setStudents);
  }, []);

  // 🔹 Filter data based on selection
  const displayedStudents = useMemo(() => {
    if (!selectedStudentId) return students;
    return students.filter(s => s.student_id === selectedStudentId);
  }, [students, selectedStudentId]);

  const avgStats = useMemo(() => {
    if (!displayedStudents.length) return null;
    const fields = ["comprehension","attention","focus","retention","assessment_score"];
    const totals = fields.map(f => displayedStudents.reduce((a,s) => a+s[f],0) / displayedStudents.length);
    return fields.reduce((acc, f, i) => ({...acc, [f]: parseFloat(totals[i].toFixed(1))}), {});
  }, [displayedStudents]);

  const filtered = useMemo(() => {
    return displayedStudents.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.persona.toLowerCase().includes(search.toLowerCase())
    );
  }, [displayedStudents, search]);

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a,b) => {
      if (typeof a[sortField] === "number") {
        return sortOrder === "asc" ? a[sortField]-b[sortField] : b[sortField]-a[sortField];
      } else {
        return sortOrder === "asc"
          ? String(a[sortField]).localeCompare(String(b[sortField]))
          : String(b[sortField]).localeCompare(String(a[sortField]));
      }
    });
  }, [filtered, sortField, sortOrder]);

  const skillVsScore = useMemo(() => {
    return displayedStudents.map(s => ({
      name: s.name,
      comprehension: s.comprehension,
      attention: s.attention,
      focus: s.focus,
      retention: s.retention,
      assessment_score: s.assessment_score
    }));
  }, [displayedStudents]);

  const attentionVsPerformance = useMemo(() => {
    return displayedStudents.map(s => ({
      x: s.attention,
      y: s.assessment_score,
      name: s.name
    }));
  }, [displayedStudents]);

  const radarData = useMemo(() => {
    if (displayedStudents.length !== 1) return [];
    const s = displayedStudents[0];
    return [
      { skill: "Comprehension", value: s.comprehension },
      { skill: "Attention", value: s.attention },
      { skill: "Focus", value: s.focus },
      { skill: "Retention", value: s.retention },
      { skill: "Assessment", value: s.assessment_score },
    ];
  }, [displayedStudents]);

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-indigo-700 mb-2">📊 Student Performance Dashboard</h1>

      {/* 🔹 Student Selection Bar */}
      <div className="flex justify-center">
        <select
          onChange={(e) => setSelectedStudentId(e.target.value)}
          value={selectedStudentId}
          className="border p-2 rounded-md shadow"
        >
          <option value="">Show All Students</option>
          {students.map(s => (
            <option key={s.student_id} value={s.student_id}>
              {s.student_id} - {s.name}
            </option>
          ))}
        </select><p className="text-gray-500 text-sm">Select here for a single student's performance</p>
        
      </div>
      
      

      {/* Overview Stats */}
      {avgStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(avgStats).map(([k,v])=>(
            <div key={k} className="p-4 bg-white shadow-md rounded-xl text-center border hover:shadow-lg transition">
              <h3 className="text-sm uppercase font-semibold text-gray-500">{k}</h3>
              <p className="text-2xl font-bold text-indigo-600">{v}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="space-y-8">

        {/* Skill vs Score */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">📈 Skill vs Score</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillVsScore}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-30}
                  textAnchor="end"
                  label={{ value: "Students", position: "insideBottom", offset: -5 }}
                />
                <YAxis
                  label={{ value: "Scores", angle: -90, position: "insideLeft" }}
                />
                <ReTooltip />
                <Legend />
                <Bar dataKey="comprehension" fill="#6366f1" name="Comprehension" />
                <Bar dataKey="attention" fill="#22c55e" name="Attention" />
                <Bar dataKey="focus" fill="#f59e0b" name="Focus" />
                <Bar dataKey="retention" fill="#ef4444" name="Retention" />
                <Line type="monotone" dataKey="assessment_score" stroke="#0ea5e9" name="Assessment Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attention vs Performance */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">📌 Attention vs Performance</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid />
                <XAxis
                  dataKey="x"
                  name="Attention"
                  label={{ value: "Attention", position: "insideBottom", offset: -5 }}
                />
                <YAxis
                  dataKey="y"
                  name="Score"
                  label={{ value: "Assessment Score", angle: -90, position: "insideLeft" }}
                />
                <ReTooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={attentionVsPerformance} fill="#8b5cf6" name="Students" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Profile (Radar) */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">🧠 Student Profile (Radar)</h2>
          <div className="h-96">
            {displayedStudents.length === 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis />
                  <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center mt-10">Select a single student to view radar profile</p>
            )}
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">📋 Students</h2>
        <input
          type="text"
          placeholder="Search by name or persona..."
          className="border p-2 mb-4 w-full rounded-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full border">
            <thead className="bg-indigo-100">
              <tr>
                {["student_id","name","class","comprehension","attention","focus","retention","assessment_score","persona"].map(col=>(
                  <th
                    key={col}
                    onClick={()=>{
                      if (sortField===col) setSortOrder(sortOrder==="asc"?"desc":"asc");
                      else {setSortField(col); setSortOrder("asc");}
                    }}
                    className="px-3 py-2 text-left text-sm font-medium cursor-pointer"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(s=>(
                <tr key={s.student_id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">{s.student_id}</td>
                  <td className="px-3 py-2">{s.name}</td>
                  <td className="px-3 py-2">{s.class}</td>
                  <td className="px-3 py-2">{s.comprehension}</td>
                  <td className="px-3 py-2">{s.attention}</td>
                  <td className="px-3 py-2">{s.focus}</td>
                  <td className="px-3 py-2">{s.retention}</td>
                  <td className="px-3 py-2">{s.assessment_score}</td>
                  <td className="px-3 py-2">{s.persona}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-2 text-gray-700">💡 Insights</h2>
        <ul className="list-disc ml-6 space-y-1 text-gray-600">
          <li>High Performers generally show higher comprehension and attention.</li>
          <li>Attention and assessment scores have a visible positive correlation.</li>
          <li>Struggling Learners show lower focus and retention on average.</li>
        </ul>
      </div>
    </div>
  );
}