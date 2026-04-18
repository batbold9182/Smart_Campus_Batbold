import { useEffect } from "react";
import useAuthGuard from "../../hooks/useAuthGuard";
import { useUserStore } from "../../store/useUserStore";
import SharedProfileScreen from "../../components/SharedProfileScreen";

export default function AdminProfile() {
  const { loading } = useAuthGuard("admin");
  const { user, fetchUser } = useUserStore();

  useEffect(() => {
    if (!user) fetchUser();
  }, [user, fetchUser]);

  return <SharedProfileScreen user={user} loading={loading} dashboardRoute="/admin/dashboard" />;
}
