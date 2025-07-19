import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAtom } from "jotai";
import { searchResultAtom } from "@/lib/store";
import { IUser } from "@ping/db";

const conversations = [
  {
    id: 1,
    name: "Alice",
    lastMessage: "Hey, how are you?",
    timestamp: "2023-10-01 10:00 AM",
  },
  {
    id: 2,
    name: "Bob",
    lastMessage: "Let’s catch up later.",
    timestamp: "2023-10-01 09:30 AM",
  },
  {
    id: 3,
    name: "Charlie",
    lastMessage: "Did you finish the project?",
    timestamp: "2023-10-01 09:00 AM",
  },
];

interface ConversationProps {
  searchResults: IUser[];
}

const Conversations = ({ searchResults }: ConversationProps) => {
  if (searchResults.length > 0) {
    return <UserSearchResults users={searchResults} />;
  }

  return (
    <div>
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className="p-4 hover:bg-accent cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Avatar className="size-10 border">
                <AvatarImage>
                  <img src={undefined} alt={conversation.name} />
                </AvatarImage>
                <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{conversation.name}</h3>
                <p className="text-sm line-clamp-1 text-gray-600">
                  {conversation.lastMessage}
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(conversation.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

interface UserSearchResultsProps {
  users: IUser[];
}

const UserSearchResults = ({ users }: UserSearchResultsProps) => {
  return (
    <div>
      {users.map((user) => (
        <div key={user._id} className="p-4 hover:bg-accent cursor-pointer">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Avatar className="size-10 border">
                <AvatarImage>
                  <img src={undefined} alt={user.fullName} />
                </AvatarImage>
                <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{user.fullName}</h3>
                <p className="text-sm line-clamp-1 text-gray-600">
                  Hello, I am {user.fullName}!
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-400">
              {new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Conversations;
