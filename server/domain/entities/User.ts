export interface User {
  id: string;
  username: string;
  password: string;
  approved: boolean;
}

export interface UserDTO {
  id: string;
  username: string;
  approved: boolean;
}

export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    username: user.username,
    approved: user.approved,
  };
}
