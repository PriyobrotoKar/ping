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
import { IconCheck, IconLoader, IconPlus } from "@tabler/icons-react";
import { cn, sleep } from "@/lib/utils";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import SearchBox from "./SearchBox";
import { IChat, IUser } from "@ping/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import UserService from "@/api/services/user";
import { useAuth } from "@/providers/AuthProvider";
import ChatService from "@/api/services/chat";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

const CreateGroupDialog = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [members, setMembers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const mutation = useMutation({
    mutationFn: async () =>
      ChatService.createChat({
        userIds: [...members, auth?._id.toString()!],
        groupName,
      }),
    onError: (error) => {
      console.error("Error creating group:", error);
      toast.error("Failed to create group. Please try again.");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["chats"],
      });
      navigate({
        to: `/public/${data._id.toString()}`,
      });
      cleanUp();
    },
  });

  const handleGroupCreate = async () => {
    if (!groupName.trim()) {
      return;
    }
    console.log("Creating group with members:", members);
    console.log("Group name:", groupName);

    mutation.mutate();
  };

  const cleanUp = async () => {
    setOpen(false);
    setMembers([]);
    setGroupName("");
    await sleep(100);
    setStep(0);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => (!open ? cleanUp() : setOpen(true))}
    >
      <DialogTrigger asChild>
        <Button className="w-full">Create New Group</Button>
      </DialogTrigger>

      <DialogContent className="gap-6 max-h-[32rem] flex flex-col sm:max-w-[24rem]">
        {step === 0 ? (
          <AddMembers
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
  members: string[];
  setMembers: (members: string[]) => void;
  setStep: (step: number) => void;
}

const AddMembers = ({ setMembers, members, setStep }: AddMembersProps) => {
  const { auth } = useAuth();
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const {
    data: allUsers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => UserService.getAllUsers(),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[32rem] justify-center items-center flex-1">
        <IconLoader className="animate-spin" />
      </div>
    );
  }

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

      <SearchBox setValue={setSearchResults} type="users" />

      <div className="overflow-y-auto">
        {data.map((user, index) => {
          if (user._id === auth?._id) return;
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
                  if (members.includes(user._id.toString())) {
                    setMembers(
                      members.filter((m) => m !== user._id.toString()),
                    );
                  } else {
                    setMembers([...members, user._id.toString()]);
                  }
                }}
                variant={"outline"}
                className={cn(
                  members.includes(user._id.toString()) && "bg-accent",
                )}
                size={"icon"}
              >
                {members.includes(user._id.toString()) ? (
                  <IconCheck />
                ) : (
                  <IconPlus />
                )}
              </Button>
            </div>
          );
        })}
      </div>

      <Button
        disabled={members.length === 0}
        onClick={() => setStep(1)}
        className="w-full"
      >
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
