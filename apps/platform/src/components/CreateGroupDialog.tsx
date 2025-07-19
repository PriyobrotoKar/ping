import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { IconCheck, IconPlus } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import SearchBox from "./SearchBox";
import { IUser } from "@ping/db";
import { useQuery } from "@tanstack/react-query";
import UserService from "@/api/services/user";

const CreateGroupDialog = () => {
  const [step, setStep] = useState(0);
  const [members, setMembers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");

  const allMembers = [
    "John Doe",
    "Jane Smith",
    "Alice Johnson",
    "Bob Brown",
    "Charlie Davis",
  ];

  const handleGroupCreate = async () => {
    console.log("Creating group with members:", members);
    console.log("Group name:", groupName);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Create New Group</Button>
      </DialogTrigger>

      <DialogContent className="gap-6 flex flex-col sm:max-w-[24rem]">
        {step === 0 ? (
          <AddMembers
            allMembers={allMembers}
            members={members}
            setMembers={setMembers}
            setStep={setStep}
          />
        ) : (
          <GroupDetails
            setStep={setStep}
            groupName={groupName}
            setGroupName={setGroupName}
            handleGroupCreate={handleGroupCreate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;

interface AddMembersProps {
  allMembers: string[];
  members: string[];
  setMembers: (members: string[]) => void;
  setStep: (step: number) => void;
}

const AddMembers = ({
  allMembers,
  setMembers,
  members,
  setStep,
}: AddMembersProps) => {
  const [searchResults, setSearchResults] = useState<IUser[]>([]);

  const {
    data: allUsers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => UserService.getAllUsers(),
  });

  if (isError || !allUsers) {
    return <div>Error loading members</div>;
  }

  const data = searchResults.length > 0 ? searchResults : allUsers;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Members</DialogTitle>

        <DialogDescription>
          Select the members who will participate in your chat room
        </DialogDescription>
      </DialogHeader>

      <SearchBox setValue={setSearchResults} />

      <div>
        {data.map((user, index) => {
          return (
            <div
              className="flex gap-2 items-center justify-between p-2"
              key={index}
            >
              <div className="flex gap-2 items-center">
                <Avatar className="size-10 border">
                  <AvatarImage>
                    <img src={undefined} alt={user.fullName} />
                  </AvatarImage>
                  <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="font-medium">{user.fullName}</div>
              </div>
              <Button
                onClick={() => {
                  if (members.includes(user._id)) {
                    setMembers(members.filter((m) => m !== user._id));
                  } else {
                    setMembers([...members, user._id]);
                  }
                }}
                variant={"outline"}
                className={cn(members.includes(user._id) && "bg-accent")}
                size={"icon"}
              >
                {members.includes(user._id) ? <IconCheck /> : <IconPlus />}
              </Button>
            </div>
          );
        })}
      </div>

      <Button onClick={() => setStep(1)} className="w-full">
        {members.length > 0 && (
          <span className="bg-secondary text-secondary-foreground size-4 rounded-full text-xs flex justify-center items-center">
            {members.length}
          </span>
        )}
        Continue
      </Button>
    </>
  );
};

interface GroupDetailsProps {
  groupName: string;
  setStep: (step: number) => void;
  setGroupName: (name: string) => void;
  handleGroupCreate: () => Promise<void>;
}

const GroupDetails = ({
  setStep,
  groupName,
  setGroupName,
  handleGroupCreate,
}: GroupDetailsProps) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Group Info</DialogTitle>

        <DialogDescription>
          Select the members who will participate in your chat room
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <Label>Group Name</Label>
        <Input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => setStep(0)}
          variant={"secondary"}
          className="flex-1"
        >
          Back
        </Button>
        <Button className="flex-1" onClick={handleGroupCreate}>
          Create Group
        </Button>
      </div>
    </>
  );
};
