import { cn } from "@/lib/format";
import {
  useEffect,
  useState,
  type CSSProperties,
  type ImgHTMLAttributes,
} from "react";

export const DEFAULT_IMAGE_FALLBACK = "/profile-placeholder.svg";

type ImageFit = "cover" | "contain";
type ImageRadius = "none" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
type ImageVariant = "default" | "profile" | "icon" | "cover" | "banner" | "avatar";

export type ImageSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "full";

const sizeStyles: Record<Exclude<ImageSize, "full">, string> = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-20 h-20",
  "2xl": "w-24 h-24",
  "3xl": "w-32 h-32",
  "4xl": "w-44 h-44",
  "5xl": "w-52 h-52",
  "6xl": "w-56 h-56",
};

const radiusStyles: Record<ImageRadius, string> = {
  none: "rounded-none",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  full: "rounded-full",
};

const variantStyles: Record<
  ImageVariant,
  { img: string; fit: ImageFit; rounded: ImageRadius }
> = {
  default: { img: "", fit: "cover", rounded: "lg" },
  profile: {
    img: "w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56",
    fit: "cover",
    rounded: "2xl",
  },
  icon: { img: "w-12 h-12", fit: "contain", rounded: "none" },
  cover: { img: "w-full aspect-video", fit: "cover", rounded: "2xl" },
  banner: { img: "w-full h-auto", fit: "cover", rounded: "2xl" },
  avatar: { img: "w-10 h-10", fit: "cover", rounded: "full" },
};

function resolveDimensions({
  size,
  width,
  height,
}: {
  size?: ImageSize | number;
  width?: number | string;
  height?: number | string;
}): { className: string; style: CSSProperties } {
  const hasExplicitDimensions =
    size !== undefined || width !== undefined || height !== undefined;

  if (!hasExplicitDimensions) {
    return { className: "", style: {} };
  }

  if (size === "full") {
    return { className: "w-full h-auto", style: {} };
  }

  if (typeof size === "number") {
    return { className: "", style: { width: size, height: size } };
  }

  if (typeof size === "string") {
    return { className: sizeStyles[size], style: {} };
  }

  const classNames: string[] = [];
  const style: CSSProperties = {};

  if (typeof width === "number") {
    style.width = width;
  } else if (typeof width === "string") {
    classNames.push(width);
  }

  if (typeof height === "number") {
    style.height = height;
  } else if (typeof height === "string") {
    classNames.push(height);
  }

  return { className: classNames.join(" "), style };
}

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  alt: string;
  fallback?: string;
  variant?: ImageVariant;
  size?: ImageSize | number;
  width?: number | string;
  height?: number | string;
  fit?: ImageFit;
  rounded?: ImageRadius;
  frame?: boolean;
  glow?: boolean;
  wrapperClassName?: string;
}

export function Image({
  src,
  alt,
  fallback = DEFAULT_IMAGE_FALLBACK,
  variant = "default",
  size,
  width,
  height,
  fit,
  rounded,
  frame = false,
  glow = false,
  wrapperClassName,
  className,
  style,
  loading = "lazy",
  onError,
  ...props
}: ImageProps) {
  const preset = variantStyles[variant];
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  const resolvedFit = fit ?? preset.fit;
  const resolvedRounded = rounded ?? preset.rounded;
  const dimensions = resolveDimensions({ size, width, height });
  const hasExplicitDimensions =
    size !== undefined || width !== undefined || height !== undefined;

  const image = (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      loading={loading}
      style={{ ...dimensions.style, ...style }}
      className={cn(
        "bg-surface-overlay",
        !hasExplicitDimensions && preset.img,
        dimensions.className,
        radiusStyles[resolvedRounded],
        resolvedFit === "cover" ? "object-cover" : "object-contain",
        className,
      )}
      onError={(event) => {
        if (currentSrc !== fallback) {
          setCurrentSrc(fallback);
        }
        onError?.(event);
      }}
    />
  );

  if (!frame) {
    return image;
  }

  return (
    <div className={cn("relative shrink-0", wrapperClassName)}>
      {glow && (
        <div
          className={cn(
            "absolute -inset-1 bg-gradient-to-br from-blue-500/40 via-sky-400/20 to-blue-600/30 blur-md",
            radiusStyles[resolvedRounded === "full" ? "full" : "3xl"],
          )}
          aria-hidden
        />
      )}
      <div
        className={cn(
          "relative glass p-1.5",
          radiusStyles[resolvedRounded === "full" ? "full" : "3xl"],
        )}
      >
        {image}
      </div>
    </div>
  );
}
