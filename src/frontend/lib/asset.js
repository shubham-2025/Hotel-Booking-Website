export function assetToUrl(asset) {
  if (!asset) {
    return "";
  }

  if (typeof asset === "string") {
    return asset;
  }

  if (typeof asset === "object" && "src" in asset) {
    return asset.src;
  }

  return "";
}
