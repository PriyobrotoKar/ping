import ProfileMenu from "./ProfileMenu";
import Conversations from "./Conversations";
import CreateGroupDialog from "./CreateGroupDialog";
import SearchBox from "./SearchBox";
import { useState } from "react";
import { IUser } from "@ping/db";
import Logo from "./Logo";

const ChatSidebar = () => {
  const [searchResults, setSearchResults] = useState<IUser[]>([]);

  return (
    <div className="w-80 flex gap-4 flex-col border-r">
      <div className="px-5 pt-4 space-y-3">
        <Logo type="full" />
        <SearchBox setValue={setSearchResults} />
      </div>

      <hr />

      <div>
        <div className="px-5 space-y-2">
          <h2 className="font-medium">Messages</h2>
          <CreateGroupDialog />
        </div>
      </div>

      <div className="flex-1 py-2">
        <Conversations searchResults={searchResults} />
      </div>

      <div className="px-2 py-4">
        <ProfileMenu />
      </div>
    </div>
  );
};

export default ChatSidebar;
