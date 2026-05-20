import axiosInstance from "@/api/axiosConfig";

export type SubscriptionPlan = "free" | "pro" | "elite";

export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "trialing"
  | "past_due"
  | "canceled";

export interface UserSubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  currentPeriodEnd?: string | null;
}

export interface IUser {
  _id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  active: boolean;
  avatar?: string;
  subscription?: UserSubscription;
  preferences?: {
    language: "en" | "de" | "es";
    theme: "system" | "light" | "dark";
    unitSystem: "metric" | "imperial";
  };

  macroGoals?: {
    kcal: number;
    protein: number;
    carbs: number;
    fats: number;
  };

  notifications?: {
    meals: boolean;
    weekly: boolean;
    product: boolean;
  };

  createdAt?: string;
  updatedAt?: string;
}
export type LoginResponse = { token: string; user: IUser };

export type UsersListResponse = {
  page: number;
  limit: number;
  total: number;
  users: IUser[];
};

export async function registerUser(input: {
  email: string;
  username: string;
  password: string;
  avatarFile?: File;
}): Promise<IUser> {
  if (input.avatarFile) {
    const fd = new FormData();
    fd.append("email", input.email);
    fd.append("username", input.username);
    fd.append("password", input.password);
    fd.append("avatar", input.avatarFile);
    const { data } = await axiosInstance.post<IUser>("/register", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } else {
    const { data } = await axiosInstance.post<IUser>("/register", {
      email: input.email,
      username: input.username,
      password: input.password,
    });
    return data;
  }
}

// Login (email + password). Devuelve token + user
export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>("/login", {
    email,
    password,
  });
  localStorage.setItem("token", data.token);
  return data;
}

export async function getMe(): Promise<IUser> {
  const { data } = await axiosInstance.get<IUser>("/me");
  return data;
}

export async function updateMe(patch: Partial<IUser>): Promise<IUser> {
  const { data } = await axiosInstance.patch<IUser>("/me", patch);
  return data;
}

export async function updateAvatar(file: File): Promise<IUser> {
  const fd = new FormData();
  fd.append("avatar", file);

  const { data } = await axiosInstance.patch<IUser>("/me/avatar", fd);

  return data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true }> {
  const { data } = await axiosInstance.post<{ ok: true }>("/change-password", {
    currentPassword,
    newPassword,
  });
  return data;
}

export async function logoutUser(): Promise<void> {
  try {
    await axiosInstance.post("/logout");
  } finally {
    localStorage.removeItem("token");
  }
}

/** ===== Admin endpoints ===== */
export async function getUsers(params?: {
  page?: number;
  limit?: number;
  q?: string;
  active?: boolean;
  sort?: string;
}): Promise<UsersListResponse> {
  const { data } = await axiosInstance.get<UsersListResponse>("/users", {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
      q: params?.q,
      active: params?.active,
      sort: params?.sort ?? "-createdAt",
    },
  });
  return data;
}

// Dar/quitar admin
export async function setUserAdmin(
  userId: string,
  isAdmin: boolean,
): Promise<IUser> {
  const { data } = await axiosInstance.patch<IUser>(
    `/admin/users/${userId}/is-admin`,
    { isAdmin },
  );
  return data;
}

// Desactivar (soft delete)
export async function deactivateUser(userId: string): Promise<IUser> {
  const { data } = await axiosInstance.patch<IUser>(
    `/admin/users/${userId}/deactivate`,
  );
  return data;
}

// Borrar (hard delete + cascade)
export async function deleteUser(userId: string): Promise<void> {
  await axiosInstance.delete(`/admin/users/${userId}`);
}

export async function requestPasswordReset(email: string): Promise<{
  ok: boolean;
  preview?: string;
  resetLink?: string;
}> {
  const { data } = await axiosInstance.post("/forgot-password", { email });
  return data;
}
export async function resetPassword(
  token: string,
  email: string,
  newPassword: string,
): Promise<void> {
  await axiosInstance.post("/reset-password", { token, email, newPassword });
}
