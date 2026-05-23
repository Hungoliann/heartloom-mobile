import React from "react";
import LogoSvg from "../../../assets/images/logo.svg";

interface HeartloomLogoProps {
  size?: number;
}

export function HeartloomLogo({ size = 120 }: HeartloomLogoProps) {
  return <LogoSvg width={size} height={size} />;
}
