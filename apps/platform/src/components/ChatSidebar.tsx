import { IconSearch } from "@tabler/icons-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import ProfileMenu from "./ProfileMenu";
import Conversations from "./Conversations";
import CreateGroupDialog from "./CreateGroupDialog";

const ChatSidebar = () => {
  return (
    <div className="w-80 flex gap-4 flex-col border-r">
      <div className="px-5 pt-4 space-y-3">
        <img src="logo-large.png" alt="Logo" />
        <div className="flex px-3 text-muted-foreground rounded-lg border items-center">
          <IconSearch />
          <Input
            placeholder="Search..."
            className="bg-transparent focus-visible:ring-0 border-0 shadow-none"
            type="text"
          />
        </div>
      </div>

      <hr />

      <div>
        <div className="px-5 space-y-2">
          <h2 className="font-medium">Messages</h2>
          <CreateGroupDialog />
        </div>
      </div>

      <div className="flex-1 py-2">
        <Conversations />
      </div>

      <div className="px-2 py-4">
        <ProfileMenu />
      </div>
    </div>
  );
};

export default ChatSidebar;
