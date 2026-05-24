import { useEffect, useState } from 'react';
import { getUsers, updateUserRole } from '../services/userService';

const ROLE_OPTIONS = ['admin', 'employee', 'security'];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data.users || []);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Could not load users',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      setSavingId(userId);
      const response = await updateUserRole(userId, role);
      setUsers((currentUsers) =>
        currentUsers.map((user) => (user._id === userId ? response.user : user))
      );
      setMessage({ type: 'success', text: 'Role updated successfully' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Could not update role',
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-br from-black via-slate-950 to-slate-900" />
        <div className="absolute -top-44 left-1/2 h-104 w-248 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-44 top-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -right-56 top-10 h-112 w-112 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest text-white/50 uppercase">Administration</p>
          <h1 className="text-3xl font-black tracking-tight text-white">User Management</h1>
          <p className="text-white/55 mt-2">Adjust user roles without touching the database.</p>
        </div>

        {message && (
          <div
            className={[
              'mb-6 rounded-2xl border px-4 py-3 text-sm font-semibold',
              message.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-100 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-100 border-rose-500/20',
            ].join(' ')}
          >
            {message.text}
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_20px_55px_-35px_rgba(0,0,0,0.9)] overflow-hidden">
          <div className="border-b border-white/10 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-white">Registered Users</h2>
                <p className="text-sm text-white/55 mt-1">Change a user role from the dropdown.</p>
              </div>
              <button
                onClick={loadUsers}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-white/4">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-white/50">Loading…</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-white/50">No users found</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60 capitalize">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          disabled={savingId === user._id}
                          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-white/20 focus:ring-4 focus:ring-white/10 disabled:opacity-60"
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}