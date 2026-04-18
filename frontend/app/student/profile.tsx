import { useEffect } from "react";
import { useUserStore } from "../../store/useUserStore";
import SharedProfileScreen from "../../components/SharedProfileScreen";

export default function StudentProfile() {
  const { user, fetchUser } = useUserStore();

  useEffect(() => {
    if (!user) fetchUser();
  }, [user, fetchUser]);

  return <SharedProfileScreen user={user} dashboardRoute="/student/dashboard" />;
}
