// components/UserList.tsx
import React from 'react';
import {
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
} from '@mui/material';
import type { User } from '../types/chat';

interface UserListProps {
  users: User[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  selectedUserId,
  onSelectUser,
}) => {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        Usuarios conectados ({users.length})
      </Typography>
      
      <List sx={{ flex: 1, overflow: 'auto', borderLeft: 1, borderColor: 'divider' }}>
        {users.length === 0 ? (
          <Typography sx={{ p: 2 }} color="text.secondary">
            No hay usuarios conectados
          </Typography>
        ) : (
          users.map((user) => (
            <ListItemButton
              key={user.id}
              selected={user.id === selectedUserId}
              onClick={() => onSelectUser(user.id)}
            >
              <ListItemText primary={user.name} />
            </ListItemButton>
          ))
        )}
      </List>
    </Box>
  );
};

export default UserList;