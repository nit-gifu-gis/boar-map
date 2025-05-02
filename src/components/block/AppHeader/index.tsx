"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getFormUrl } from "@/utils/questionaire";
import { ReactNode, useEffect, useState } from "react";

interface AppHeaderProps {
  children?: ReactNode;
  color?: string;
}

const AppHeader = ({}: AppHeaderProps) => {
  // const { appLogs } = useAppLogs();
  const { currentUser /* isAuthChecking */ } = useCurrentUser();
  // const [isOpen, setOpen] = useState(false);
  const [, /* formUrl */ setFormUrl] = useState("");
  // const [manualViewer, setManualViewer] = useState<ReactNode>(null);
  // const setCurrentUser = useSetAtom(currentUserState);
  // const router = useRouter();

  useEffect(() => {
    if (currentUser === undefined) return;
    setFormUrl(getFormUrl(currentUser));
  }, [currentUser]);

  return <></>;
};

export default AppHeader;
