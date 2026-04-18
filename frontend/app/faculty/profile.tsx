import { useEffect } from "react";
import { useUserStore } from "../../store/useUserStore";
import SharedProfileScreen from "../../components/SharedProfileScreen";

export default function FacultyProfile() {
  const { user, fetchUser } = useUserStore();

  useEffect(() => {
    if (!user) fetchUser();
  }, [user, fetchUser]);

  return <SharedProfileScreen user={user} dashboardRoute="/faculty/dashboard" />;
}
