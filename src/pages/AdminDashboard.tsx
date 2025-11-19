// src/pages/AdminDashboard.tsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  updateDoc,
  doc,
  addDoc,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, CheckCircle, XCircle, Clock } from "lucide-react";

type Teacher = {
  id: string;
  name?: string;
  email?: string;
  qualification?: string;
  teaching_field?: string;
  work_experience?: string;
  verification_status?: "pending" | "verified" | "rejected";
  certificates?: string[];
  created_at?: any;
};

const PAGE_SIZE = 10;

const statusBadge = (status?: string) => {
  switch (status) {
    case "verified":
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-green-50 text-green-800 text-sm">
          <CheckCircle className="w-4 h-4" /> Verified
        </div>
      );
    case "pending":
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-yellow-50 text-yellow-800 text-sm">
          <Clock className="w-4 h-4" /> Pending
        </div>
      );
    case "rejected":
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-50 text-red-800 text-sm">
          <XCircle className="w-4 h-4" /> Rejected
        </div>
      );
    default:
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gray-50 text-gray-800 text-sm">
          Unknown
        </div>
      );
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Auth check
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Data
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // UI controls
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");
  const [sortBy, setSortBy] = useState<"created_at" | "name" | "qualification">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Pagination
  const [pageCursor, setPageCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [pageHistory, setPageHistory] = useState<(QueryDocumentSnapshot<DocumentData> | null)[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
  });

  // Modal
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Admin auth check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      try {
        setLoadingAuth(true);
        if (!user) {
          setIsAdmin(false);
          navigate("/auth");
          return;
        }

        const adminSnap = await getDocs(
          query(collection(db, "admins"), where("__name__", "==", user.uid))
        );

        const isAdminDoc = adminSnap.docs.some((d) => d.id === user.uid);

        if (!isAdminDoc) {
          toast.error("Not authorized as admin");
          setIsAdmin(false);
          navigate("/auth");
          return;
        }

        setIsAdmin(true);
        await loadPage(null, true);
        await loadStats();
      } finally {
        setLoadingAuth(false);
      }
    });

    return () => unsub();
  }, []);

  // Stats loader
  const loadStats = async () => {
    const snap = await getDocs(collection(db, "teachers"));
    const docs = snap.docs.map((d) => d.data() as Teacher);

    setStats({
      total: docs.length,
      pending: docs.filter((t) => t.verification_status === "pending").length,
      verified: docs.filter((t) => t.verification_status === "verified").length,
      rejected: docs.filter((t) => t.verification_status === "rejected").length,
    });
  };

  // Main paginator
  const loadPage = async (
    cursor: QueryDocumentSnapshot<DocumentData> | null = null,
    resetHistory = false
  ) => {
    setIsLoadingData(true);

    try {
      let q = query(collection(db, "teachers"));

      // Filter
      if (filter !== "all") {
        q = query(collection(db, "teachers"), where("verification_status", "==", filter));
      }

      // Sorting
      const orderField =
        sortBy === "name"
          ? "name"
          : sortBy === "qualification"
          ? "qualification"
          : "created_at";

      q = query(q, orderBy(orderField, sortDir));

      // Pagination
      if (cursor) q = query(q, startAfter(cursor), limit(PAGE_SIZE));
      else q = query(q, limit(PAGE_SIZE));

      const snap = await getDocs(q);

      const docs = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Teacher),
      }));

      // Client-side search
      const filtered = docs.filter((t) => {
        if (!search) return true;
        const n = search.toLowerCase();
        return (
          (t.name ?? "").toLowerCase().includes(n) ||
          (t.email ?? "").toLowerCase().includes(n) ||
          (t.teaching_field ?? "").toLowerCase().includes(n)
        );
      });

      setTeachers(filtered);

      if (resetHistory) setPageHistory([cursor]);
      else setPageHistory((p) => [...p, cursor]);

      setHasMore(snap.docs.length === PAGE_SIZE);
      setPageCursor(snap.docs.length ? snap.docs[snap.docs.length - 1] : null);
    } catch (err) {
      toast.error("Failed to load teachers");
    } finally {
      setIsLoadingData(false);
    }
  };

  const goNext = async () => {
    if (pageCursor) loadPage(pageCursor);
  };

  const goFirst = async () => {
    loadPage(null, true);
  };

  // Approve teacher (YOUR NEW LOGIC)
  const approveTeacher = async (teacherId: string) => {
    await updateDoc(doc(db, "teachers", teacherId), {
      verification_status: "verified",
    });

    toast.success("Teacher verified!");

    await loadPage(null, true);
    await loadStats();
  };

  // Reject teacher (YOUR NEW LOGIC)
  const rejectTeacher = async (teacherId: string) => {
    await updateDoc(doc(db, "teachers", teacherId), {
      verification_status: "rejected",
    });

    toast.error("Teacher rejected");

    await loadPage(null, true);
    await loadStats();
  };

  const openTeacherModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTeacher(null);
    setModalOpen(false);
    setPdfUrl(null);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/auth");
  };

  useEffect(() => {
    if (isAdmin) {
      loadPage(null, true);
      loadStats();
    }
  }, [filter, sortBy, sortDir, search]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <CardTitle>Total</CardTitle>
          <CardContent>{stats.total}</CardContent>
        </Card>
        <Card className="p-4">
          <CardTitle>Pending</CardTitle>
          <CardContent>{stats.pending}</CardContent>
        </Card>
        <Card className="p-4">
          <CardTitle>Verified</CardTitle>
          <CardContent>{stats.verified}</CardContent>
        </Card>
        <Card className="p-4">
          <CardTitle>Rejected</CardTitle>
          <CardContent>{stats.rejected}</CardContent>
        </Card>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          className="border rounded px-3 py-2 w-full md:w-1/3"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded px-3 py-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          className="border rounded px-3 py-2"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
        >
          <option value="created_at">Newest</option>
          <option value="name">Name</option>
          <option value="qualification">Qualification</option>
        </select>

        <select
          className="border rounded px-3 py-2"
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value as any)}
        >
          <option value="desc">↓</option>
          <option value="asc">↑</option>
        </select>
      </div>

      {/* Teachers list */}
      <div className="grid md:grid-cols-2 gap-4">
        {teachers.map((t) => (
          <Card key={t.id}>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <div className="text-lg font-semibold">{t.name}</div>
                  <div className="text-sm text-muted-foreground">{t.email}</div>
                </div>
                <div>{statusBadge(t.verification_status)}</div>
              </div>
            </CardHeader>

            <CardContent>
              <p><strong>Field:</strong> {t.teaching_field}</p>
              <p><strong>Qualification:</strong> {t.qualification}</p>
              <p><strong>Experience:</strong> {t.work_experience}</p>

              <div className="flex gap-3 mt-4">
                <Button onClick={() => openTeacherModal(t)}>View</Button>
                <Button className="bg-green-500 text-white" onClick={() => approveTeacher(t.id)}>
                  Approve
                </Button>
                <Button className="bg-red-500 text-white" onClick={() => rejectTeacher(t.id)}>
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <Button onClick={goFirst}>First</Button>
        <Button onClick={goNext} disabled={!hasMore}>Next</Button>
      </div>

      {/* Modal */}
      {modalOpen && selectedTeacher && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-6">
          <div className="bg-white rounded-lg w-full max-w-3xl p-6">
            <h2 className="text-xl font-bold">{selectedTeacher.name}</h2>
            <p>Email: {selectedTeacher.email}</p>
            <p>Field: {selectedTeacher.teaching_field}</p>
            <p>Qualification: {selectedTeacher.qualification}</p>

            <div className="mt-4 flex gap-2">
              <Button onClick={() => approveTeacher(selectedTeacher.id)}>Approve</Button>
              <Button className="bg-red-500 text-white" onClick={() => rejectTeacher(selectedTeacher.id)}>Reject</Button>
              <Button variant="ghost" onClick={closeModal}>Close</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
