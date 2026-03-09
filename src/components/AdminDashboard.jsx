import React, { useEffect, useState } from 'react';
import adminService from '../services/adminService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        adminService.getSystemStats(),
        adminService.getAllUsers(),
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (err) {
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      loadData();
    } catch (err) {
      alert('Error al cambiar el rol del usuario.');
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      await adminService.toggleUserActive(userId, !isActive);
      loadData();
    } catch (err) {
      alert('Error al cambiar el estado del usuario.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await adminService.deleteUser(userId);
        loadData();
      } catch (err) {
        alert('Error al eliminar el usuario.');
      }
    }
  };

  const handleCreateAdmin = async (formData) => {
    try {
      await adminService.createAdmin(formData);
      loadData();
    } catch (err) {
      alert('Error al crear el administrador.');
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-dashboard">
      <h1>Panel de Administración</h1>

      {stats && (
        <div className="stats">
          <h2>📊 Estadísticas del Sistema</h2>
          <p>👥 Total Usuarios: {stats.totalUsers}</p>
          <p>✅ Usuarios Activos: {stats.activeUsers}</p>
          <p>👑 Administradores: {stats.adminUsers}</p>
          <p>👤 Usuarios Regulares: {stats.regularUsers}</p>
        </div>
      )}

      <div className="user-table">
        <h2>👥 Usuarios</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.active ? 'Activo' : 'Inactivo'}</td>
                <td>
                  <button
                    onClick={() =>
                      handleChangeRole(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')
                    }
                  >
                    {user.role === 'ADMIN' ? 'Hacer Usuario' : 'Hacer Admin'}
                  </button>
                  <button
                    onClick={() => handleToggleActive(user.id, user.active)}
                  >
                    {user.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button onClick={() => handleDeleteUser(user.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="create-admin">
        <h2>➕ Crear Nuevo Administrador</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = {
              name: e.target.name.value,
              email: e.target.email.value,
              phone: e.target.phone.value,
              password: e.target.password.value,
            };
            handleCreateAdmin(formData);
          }}
        >
          <input type="text" name="name" placeholder="Nombre" required />
          <input type="email" name="email" placeholder="Email" required />
          <input type="text" name="phone" placeholder="Teléfono" required />
          <input type="password" name="password" placeholder="Contraseña" required />
          <button type="submit">Crear Admin</button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;