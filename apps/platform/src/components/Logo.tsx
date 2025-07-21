import { useTheme } from "@/providers/ThemeProvider";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  type: "full" | "icon";
}

const Logo = (props: LogoProps) => {
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">();
  const { theme } = useTheme();
  const source = `/logo-${props.type}-${resolvedTheme}.png`;

  useEffect(() => {
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setResolvedTheme(systemTheme);
      return;
    }

    setResolvedTheme(theme);
  }, [theme]);

  return (
    <Link to="/">
      <img width={100} height={40} {...props} src={source} alt="Logo" />
    </Link>
  );
};

export default Logo;
