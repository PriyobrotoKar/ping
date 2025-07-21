import ProfileMenu from "./ProfileMenu";
import Conversations from "./Conversations";
import CreateGroupDialog from "./CreateGroupDialog";
import SearchBox from "./SearchBox";
import { useState } from "react";
import { IChat, IUser } from "@ping/db";
import Logo from "./Logo";

const ChatSidebar = () => {
  const [searchResults, setSearchResults] = useState<(IUser | IChat)[]>([]);

  return (
    <div className="w-80 flex flex-col border-r">
      <div className="px-5 py-4 space-y-3">
        <Logo type="full" />
        <SearchBox setValue={setSearchResults} />
      </div>

      <hr />

      <div className="px-5 py-4 space-y-2">
        <h2 className="font-medium">Messages</h2>
        <CreateGroupDialog />
      </div>

      <div className="flex-1 overflow-auto">
        <Conversations searchResults={searchResults} />
      </div>

      <div className="px-2 border-t py-4">
        <ProfileMenu />
      </div>
    </div>
  );
};

export default ChatSidebar;
