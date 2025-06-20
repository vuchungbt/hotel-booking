# Frontend Role System Updates

## Tổng quan
Tài liệu này mô tả các cập nhật giao diện frontend để tương thích với hệ thống phân quyền mới (single role thay vì multiple roles).

## Các Component đã được cập nhật

### 1. ProtectedRoute (`/src/components/ProtectedRoute.tsx`)
**Thay đổi chính:**
- Chuyển từ `user.roles.map()` sang `user.roles[0].name`
- Thêm logic phân quyền hierarchical:
  - ADMIN: Có tất cả quyền
  - HOST: Có quyền HOST và USER
  - USER: Chỉ có quyền USER
- Cập nhật thông báo lỗi để hiển thị single role

**Code cũ:**
```typescript
const userRoles = user.roles.map(role => role.name);
if (!userRoles.includes(requiredRole)) {
```

**Code mới:**
```typescript
const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : null;
const hasPermission = () => {
  if (!userRole) return false;
  if (userRole === 'ADMIN') return true;
  if (userRole === 'HOST' && (requiredRole === 'HOST' || requiredRole === 'USER')) return true;
  if (userRole === 'USER' && requiredRole === 'USER') return true;
  return false;
};
```

### 2. ProfilePage (`/src/pages/ProfilePage.tsx`)
**Thay đổi chính:**
- Cập nhật `renderRolesTab()` để hiển thị single role
- Thêm section "Role Permissions Info" để giải thích quyền hạn của từng role
- Cập nhật logic kiểm tra Host/Admin role

**Tính năng mới:**
- Hiển thị chi tiết quyền hạn của từng role
- Giao diện đẹp hơn với color coding theo role
- Thông tin hierarchical permissions

### 3. AdminUsers (`/src/pages/admin/AdminUsers.tsx`)
**Thay đổi chính:**
- Cập nhật filter logic từ `user.roles.map()` sang `user.roles[0].name`
- Cập nhật hiển thị role trong bảng để chỉ hiển thị 1 role
- Giữ nguyên chức năng manage roles

**Code cũ:**
```typescript
const userRoles = user.roles.map(role => role.name);
const matchesRole = roleFilter === 'all' || userRoles.includes(roleFilter);
```

**Code mới:**
```typescript
const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : null;
const matchesRole = roleFilter === 'all' || userRole === roleFilter;
```

### 4. DashboardLayout (`/src/components/DashboardLayout.tsx`)
**Thay đổi chính:**
- Thêm hiển thị role badge trong user info section
- Color coding theo role (Admin: đỏ, Host: xanh lá, User: xanh dương)

**Tính năng mới:**
```typescript
{user?.roles && user.roles.length > 0 && (
  <div className="flex items-center mt-1">
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
      user.roles[0].name === 'ADMIN' ? 'bg-red-100 text-red-800' :
      user.roles[0].name === 'HOST' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
    }`}>
      {user.roles[0].name === 'ADMIN' ? 'Admin' :
       user.roles[0].name === 'HOST' ? 'Host' : 'User'}
    </span>
  </div>
)}
```

### 5. Navbar (`/src/components/Navbar.tsx`)
**Thay đổi chính:**
- Thêm role badge trong user dropdown menu
- Thêm role badge trong mobile menu
- Cập nhật logic `isAdmin` và `isHost` để sử dụng single role

**Tính năng mới:**
- User dropdown hiển thị role với màu sắc phù hợp
- Mobile menu cũng hiển thị role information

## Color Scheme cho Roles

### Role Colors
- **ADMIN**: `bg-red-100 text-red-800` (Đỏ - quyền cao nhất)
- **HOST**: `bg-green-100 text-green-800` (Xanh lá - quyền trung bình)  
- **USER**: `bg-blue-100 text-blue-800` (Xanh dương - quyền cơ bản)

### Role Display Names
- **ADMIN** → "Administrator" (trang chi tiết) / "Admin" (compact)
- **HOST** → "Hotel Owner" (trang chi tiết) / "Host" (compact)
- **USER** → "Người dùng" (trang chi tiết) / "User" (compact)

## Hierarchical Permissions Logic

### Quy tắc phân quyền
1. **ADMIN**: Có tất cả quyền (ADMIN, HOST, USER)
2. **HOST**: Có quyền HOST và USER  
3. **USER**: Chỉ có quyền USER

### Implementation trong ProtectedRoute
```typescript
const hasPermission = () => {
  if (!userRole) return false;
  
  // ADMIN has all permissions
  if (userRole === 'ADMIN') return true;
  
  // HOST has HOST and USER permissions
  if (userRole === 'HOST' && (requiredRole === 'HOST' || requiredRole === 'USER')) return true;
  
  // USER has only USER permissions
  if (userRole === 'USER' && requiredRole === 'USER') return true;
  
  return false;
};
```

## Các trang không cần cập nhật

### AdminUserDetail & AdminUserEdit
- Đã được cập nhật trước đó trong backend integration
- Hiển thị single role correctly
- UserRoleModal đã được cập nhật để handle single role

### Dashboard Components
- AdminDashboard: Không cần thay đổi (chỉ hiển thị stats)
- HostDashboard: Không cần thay đổi (chỉ hiển thị stats)

## Testing Checklist

### ✅ Đã kiểm tra
- [x] Build thành công không có lỗi
- [x] ProtectedRoute hoạt động với hierarchical permissions
- [x] ProfilePage hiển thị role information đúng
- [x] AdminUsers filter và display role đúng
- [x] DashboardLayout hiển thị role badge
- [x] Navbar hiển thị role trong dropdown và mobile menu

### 🔄 Cần test runtime
- [ ] Login với các role khác nhau
- [ ] Kiểm tra hierarchical permissions thực tế
- [ ] Test role display trên các thiết bị khác nhau
- [ ] Kiểm tra role update workflow

## Tương thích với Backend

### API Response Format
Frontend expect user object với format:
```typescript
interface User {
  roles: Array<{
    id: number;
    name: string; // 'ADMIN', 'HOST', 'USER'
    description: string;
  }>;
}
```

### Single Role Assumption
- Frontend assume `user.roles[0]` là role chính của user
- Nếu `user.roles` empty, user được coi là không có role
- Logic hierarchical được implement ở frontend để tương thích với backend

## Kết luận
Tất cả các component frontend đã được cập nhật để tương thích với hệ thống single role mới. Giao diện hiển thị role information một cách nhất quán và đẹp mắt, với hierarchical permissions được implement đúng theo yêu cầu. 