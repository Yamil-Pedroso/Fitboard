import { useQuery } from "@tanstack/react-query";
import { getUsers, type UsersListResponse } from "@/services/usersService";
import { useAuth } from "@/context/UserContext";

type Params = {
  page?: number;
  limit?: number;
  q?: string;
  active?: boolean;
  sort?: string;
};

export function useUsers(
  params: Params = { page: 1, limit: 20, sort: "-createdAt" }
) {
  const { user } = useAuth();
  return useQuery<UsersListResponse, Error>({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
    enabled: !!user?.isAdmin,
    staleTime: 30_000,
    keepPreviousData: true,
  });
}
