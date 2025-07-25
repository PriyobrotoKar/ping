import { useEffect, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { Input } from "./ui/input";
import useDebounce from "@/hooks/useDebounce";
import UserService from "@/api/services/user";
import { IChat, IUser } from "@ping/db";

interface SearchBoxProps {
  setValue: (value: (IUser | IChat)[]) => void;
  type?: "users" | "chats" | "all";
}

const SearchBox = ({ setValue, type = "all" }: SearchBoxProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const handleSearch = async (search: string) => {
    try {
      const results = await UserService.search(search, type);
      setValue(results);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  useEffect(() => {
    if (debouncedSearchQuery.trim() === "") {
      setValue([]);
      return;
    }

    handleSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  return (
    <div className="flex px-3 text-muted-foreground rounded-lg border items-center">
      <IconSearch />
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
        className="bg-transparent dark:bg-transparent focus-visible:ring-0 border-0 shadow-none"
        type="text"
      />
    </div>
  );
};

export default SearchBox;
