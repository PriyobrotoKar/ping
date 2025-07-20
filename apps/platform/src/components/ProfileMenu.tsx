import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  IconDeviceHeartMonitor,
  IconDotsVertical,
  IconLogout2,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import { useAuth } from "@/providers/AuthProvider";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { useTheme } from "@/providers/ThemeProvider";

const ProfileMenu = () => {
  const { auth, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"ghost"}
          size="lg"
          className="data-[state=open]:bg-sidebar-accent w-full h-fit py-2 data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="size-10 rounded-full">
            <AvatarImage src={undefined} alt={auth?.fullName} />
            <AvatarFallback className="rounded-lg">
              {auth?.fullName
                .split(" ")
                .map((name) => name[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{auth?.fullName}</span>
            <span className="text-muted-foreground truncate text-xs">
              {auth?.email}
            </span>
          </div>
          <IconDotsVertical className="ml-auto size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={undefined} alt={auth?.fullName} />
              <AvatarFallback className="rounded-lg">
                {auth?.fullName
                  .split(" ")
                  .map((name) => name[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{auth?.fullName}</span>
              <span className="text-muted-foreground truncate text-xs">
                {auth?.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="focus:bg-transparent">
          Theme
          <ToggleGroup
            type="single"
            value={theme}
            size={"sm"}
            variant={"outline"}
            className="rounded-full"
            onClick={(e) => e.stopPropagation()}
            onValueChange={(value: "system" | "dark" | "light") => {
              if (!value) return;
              setTheme(value);
            }}
          >
            <ToggleGroupItem variant={"outline"} value="system">
              <IconDeviceHeartMonitor />
            </ToggleGroupItem>
            <ToggleGroupItem value="light">
              <IconSun />
            </ToggleGroupItem>
            <ToggleGroupItem value="dark">
              <IconMoon />
            </ToggleGroupItem>
          </ToggleGroup>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={logout}>
          Log out
          <IconLogout2 />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;
